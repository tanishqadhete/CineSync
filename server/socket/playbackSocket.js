const Room = require("../models/Room");

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

            if (!room) {
                return socket.emit("error-message", {
                    message: "Room not found."
                });
            }

            // Only host can control playback
            if (
                !room.currentHost ||
                !room.currentHost.equals(socket.user._id)
            ) {
                return socket.emit("error-message", {
                    message: "Only the current host can control playback."
                });
            }

            const { isPlaying, currentTime } = data;

            room.isPlaying = isPlaying;
            room.currentTime = currentTime;
            room.lastActivityAt = new Date();

            await room.save();

            const serverTime = Date.now();

            socket.to(socket.roomId).emit(
                "playback-updated",
                {
                    isPlaying: room.isPlaying,
                    currentTime: room.currentTime,
                    serverTime
                }
            );

        }
        catch (err) {

            console.error(err);

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

};