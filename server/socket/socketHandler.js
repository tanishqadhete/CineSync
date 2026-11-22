
const handleRoomSocket = require("./roomSocket");
const handleChatSocket = require("./chatSocket");
const handlePlaybackSocket = require("./playbackSocket");
const Room = require("../models/Room");

const {
    cleanupExpiredRooms
} = require("../utils/roomCleanup");

// Calculate current playback position
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

module.exports = (io) => {

    // Periodic playback synchronization every 10 seconds
    const syncInterval = setInterval(async () => {
        try {
            // Only synchronize rooms with connected sockets
            const connectedRoomIds = [...io.sockets.adapter.rooms.keys()]
                .filter((roomId) => {
                    return !io.sockets.sockets.has(roomId);
                });

            if (connectedRoomIds.length === 0) {
                return;
            }

            const rooms = await Room.find({
                _id: { $in: connectedRoomIds },
                status: "ACTIVE"
            });

            const serverTime = Date.now();

            for (const room of rooms) {
                io.to(room._id.toString()).emit("playback-sync", {
                    currentTime: getPlaybackPosition(room, serverTime),
                    isPlaying: room.isPlaying,
                    serverTime,
                    version: room.playbackVersion ?? 0
                });
            }

        } catch (err) {
            console.error("Periodic playback sync error:", err);
        }
    }, 10000);

    // Clean up expired rooms every 30 seconds.
    // Rooms become eligible for deletion five minutes
    // after their movie ends.
    const cleanupInterval = setInterval(async () => {
        try {
            await cleanupExpiredRooms();
        } catch (err) {
            console.error(
                "Expired room cleanup error:",
                err
            );
        }
    }, 30000);

    // Also clean up expired rooms when the server starts.
    cleanupExpiredRooms().catch(err => {
        console.error(
            "Initial expired room cleanup error:",
            err
        );
    });

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.user.username}`
        );

        handleRoomSocket(io, socket);
        handleChatSocket(io, socket);
        handlePlaybackSocket(io, socket);

    });

    // Clear both intervals when Socket.IO shuts down.
    io.engine.on("close", () => {
        clearInterval(syncInterval);
        clearInterval(cleanupInterval);
    });
};
