const Room = require("../models/Room");
const getPlaybackPosition = (room, now = Date.now()) => {
    const position = Number(room.currentTime) || 0;

    if (!room.isPlaying) {
        return position;
    }

    const updatedAt = room.playbackUpdatedAt
        ? new Date(room.playbackUpdatedAt).getTime()
        : now;

    return position + Math.max(0, now - updatedAt) / 1000;
};
module.exports = (io, socket) => {

    // PLAY / PAUSE
    
    socket.on("play-pause", async (data) => {
        try {
            if (!socket.roomId) {
                return socket.emit("error-message", {
                    message: "You are not connected to a room."
                });
            }

            const room = await Room.findById(socket.roomId);

            if (!room || room.status !== "ACTIVE") {
                return socket.emit("error-message", {
                    message: "Active room not found."
                });
            }

            if (
                !room.currentHost ||
                !room.currentHost.equals(socket.user._id)
            ) {
                return socket.emit("error-message", {
                    message: "Only the host can control playback."
                });
            }

            const { isPlaying, currentTime } = data || {};

            if (
                typeof isPlaying !== "boolean" ||
                !Number.isFinite(currentTime) ||
                currentTime < 0
            ) {
                return socket.emit("error-message", {
                    message: "Invalid playback data."
                });
            }

            const now = new Date();

            room.currentTime = currentTime;
            room.isPlaying = isPlaying;
            room.playbackUpdatedAt = now;
            room.playbackVersion += 1;
            room.lastActivityAt = now;

            await room.save();

            io.to(socket.roomId).emit("playback-updated", {
                currentTime: room.currentTime,
                isPlaying: room.isPlaying,
                serverTime: now.getTime(),
                version: room.playbackVersion
            });

        } catch (err) {
            console.error("Playback error:", err);

            socket.emit("error-message", {
                message: "Unable to update playback."
            });
        }
    });



    // SEEK
    socket.on("seek", async (currentTime) => {

        try {

            if (!socket.roomId) {
                return socket.emit("error-message", {
                    message: "You are not connected to a room."
                });
            }

            const room = await Room.findById(socket.roomId);

            if (!room) {
                return socket.emit("error-message", {
                    message: "Room not found."
                });
            }

            // Only host can seek
            if (
                !room.currentHost ||
                !room.currentHost.equals(socket.user._id)
            ) {
                return socket.emit("error-message", {
                    message: "Only the current host can seek."
                });
            }

            if (
                typeof currentTime !== "number" ||
                currentTime < 0
            ) {
                return socket.emit("error-message", {
                    message: "Invalid playback position."
                });
            }

            room.currentTime = currentTime;
            room.lastActivityAt = new Date();

            await room.save();

            const serverTime = Date.now();

            socket.to(socket.roomId).emit(
                "playback-seeked",
                {
                    currentTime: room.currentTime,
                    serverTime
                }
            );

        }
        catch (err) {

            console.error(err);

            socket.emit("error-message", {
                message: "Unable to seek."
            });

        }

    });

    socket.on("video-ended", async () => {
        try {
            if (!socket.roomId) {
                return socket.emit("error-message", {
                    message: "You are not connected to a room."
                });
            }

            const room = await Room.findById(socket.roomId);

            if (!room) {
                return socket.emit("error-message", {
                    message: "Room not found."
                });
            }

            if (
                !room.currentHost ||
                !room.currentHost.equals(socket.user._id)
            ) {
                return socket.emit("error-message", {
                    message: "Only the host can end the movie."
                });
            }

            room.status = "ENDED";
            room.isPlaying = false;
            room.currentTime = 0;
            room.playbackUpdatedAt = new Date();
            room.playbackVersion += 1;

            // Keep room for 5 more minutes
            room.deleteAt = new Date(
                Date.now() + 5 * 60 * 1000
            );

            room.lastActivityAt = new Date();

            await room.save();

            io.to(socket.roomId).emit("room-ended", {
                roomId: room._id,
                movieId: room.movieId,
                deleteAt: room.deleteAt
            });

            console.log(
                `Room ${room.roomCode} ended.`
            );

        } catch (err) {
            console.error(
                "Video ended error:",
                err
            );

            socket.emit("error-message", {
                message: "Unable to end room."
            });
        }
    });

};