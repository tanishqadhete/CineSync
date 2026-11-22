
const Room = require("../models/Room");

// Calculate the current authoritative playback position
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
            room.playbackVersion =
                (room.playbackVersion ?? 0) + 1;
            room.lastActivityAt = now;

            await room.save();

            const serverTime = Date.now();

            io.to(socket.roomId).emit("playback-updated", {
                currentTime: getPlaybackPosition(room, serverTime),
                isPlaying: room.isPlaying,
                serverTime,
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
                    message: "Only the current host can seek."
                });
            }

            if (
                !Number.isFinite(currentTime) ||
                currentTime < 0
            ) {
                return socket.emit("error-message", {
                    message: "Invalid playback position."
                });
            }

            const now = new Date();

            room.currentTime = currentTime;
            room.playbackUpdatedAt = now;
            room.playbackVersion =
                (room.playbackVersion ?? 0) + 1;
            room.lastActivityAt = now;

            await room.save();

            const serverTime = Date.now();

            io.to(socket.roomId).emit("playback-seeked", {
                currentTime: getPlaybackPosition(room, serverTime),
                isPlaying: room.isPlaying,
                serverTime,
                version: room.playbackVersion
            });

        } catch (err) {
            console.error("Seek error:", err);

            socket.emit("error-message", {
                message: "Unable to seek."
            });
        }
    });


    // REQUEST CURRENT PLAYBACK STATE
    socket.on("request-playback-sync", async () => {
        try {
            if (!socket.roomId) return;

            const room = await Room.findById(socket.roomId);

            if (!room || room.status !== "ACTIVE") return;

            const serverTime = Date.now();

            socket.emit("playback-sync", {
                currentTime: getPlaybackPosition(room, serverTime),
                isPlaying: room.isPlaying,
                serverTime,
                version: room.playbackVersion ?? 0
            });

        } catch (err) {
            console.error("Playback sync error:", err);
        }
    });


    // VIDEO ENDED
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
            room.playbackVersion =
                (room.playbackVersion ?? 0) + 1;

            // Keep the room for 5 minutes for ratings
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
            console.error("Video ended error:", err);

            socket.emit("error-message", {
                message: "Unable to end room."
            });
        }
    });

};
