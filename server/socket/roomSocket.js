
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Message = require("../models/Message");
const User = require("../models/User");

const { removeRoomMember } = require("../utils/roomCleanup");

const DISCONNECT_GRACE_MS = 30 * 1000;

// Pending disconnect cleanup timers.
// Key: roomId:userId
const disconnectTimers = new Map();

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

const getTimerKey = (roomId, userId) =>
    `${roomId}:${userId}`;

const cancelDisconnectTimer = (roomId, userId) => {
    const key = getTimerKey(roomId, userId);
    const timer = disconnectTimers.get(key);

    if (timer) {
        clearTimeout(timer);
        disconnectTimers.delete(key);
    }
};

// Check whether this user still has another connected
// socket inside the same room.
const hasActiveSocket = async (io, roomId, userId) => {
    const sockets = await io.in(roomId).fetchSockets();

    return sockets.some(
        connectedSocket =>
            connectedSocket.user?._id?.toString() ===
                userId.toString() ||
            connectedSocket.data?.userId?.toString() ===
                userId.toString()
    );
};

module.exports = (io, socket) => {

    socket.on("join-room", async (roomCode) => {
        try {
            if (
                typeof roomCode !== "string" ||
                !roomCode.trim()
            ) {
                return socket.emit("error-message", {
                    message: "Room code is required."
                });
            }

            const room = await Room.findOne({
                roomCode: roomCode.trim().toUpperCase(),
                $or: [
                    {
                        status: "ACTIVE"
                    },
                    {
                        status: "ENDED",
                        deleteAt: { $gt: new Date() }
                    }
                ]
            })
                .populate(
                    "movieId",
                    "title description duration thumbnail videoUrl"
                )
                .populate(
                    "currentHost",
                    "username"
                );

            if (!room) {
                return socket.emit("error-message", {
                    message: "Room not found or rating period expired."
                });
            }

            const userId = socket.user._id.toString();
            const roomId = room._id.toString();

            const member = await RoomMember.findOne({
                roomId: room._id,
                userId: socket.user._id,
                isActive: true
            });

            if (!member) {
                return socket.emit("error-message", {
                    message: "You are not a member of this room."
                });
            }

            const members = await RoomMember.find({
                roomId: room._id,
                isActive: true
            }).populate("userId", "username");

            const messages = await Message.find({
                roomId: room._id
            })
                .sort({ createdAt: 1 })
                .populate("sender", "username");

            // Store user ID in socket data for reliable checks.
            socket.data.userId = userId;

            // Check whether another socket belonging to
            // this user is already connected to the room.
            const alreadyConnected = await hasActiveSocket(
                io,
                roomId,
                userId
            );

            // Cancel pending disconnect cleanup.
            cancelDisconnectTimer(roomId, userId);

            // Join Socket.IO room.
            socket.join(roomId);
            socket.roomId = roomId;

            const serverTime = Date.now();

            socket.emit("room-state", {
                isHost: Boolean(
                    room.currentHost &&
                    room.currentHost._id.toString() === userId
                ),

                room: {
                    _id: room._id,
                    roomCode: room.roomCode,
                    roomName: room.roomName,
                    maxMembers: room.maxMembers,
                    currentMembers: room.currentMembers,
                    currentHost: room.currentHost,
                    status: room.status,
                    deleteAt: room.deleteAt
                },

                movie: room.movieId,

                playback: {
                    currentTime: getPlaybackPosition(
                        room,
                        serverTime
                    ),
                    isPlaying: room.isPlaying,
                    serverTime,
                    version: room.playbackVersion ?? 0
                },

                members: members.map(member => ({
                    id: member.userId._id,
                    username: member.userId.username
                })),

                messages: messages.map(message => ({
                    id: message._id,
                    username: message.sender.username,
                    text: message.text,
                    createdAt: message.createdAt
                }))
            });

            // Notify other users only when this user
            // did not already have an active socket.
            if (!alreadyConnected && room.status === "ACTIVE") {
                socket.to(roomId).emit("member-joined", {
                    id: socket.user._id,
                    username: socket.user.username
                });
            }

            console.log(
                `${socket.user.username} joined socket room ${room.roomCode}`
            );

        } catch (err) {
            console.error("Socket join error:", err);

            socket.emit("error-message", {
                message: "Unable to join room."
            });
        }
    });

    socket.on("disconnect", () => {
        if (!socket.roomId) {
            console.log(
                `User disconnected: ${socket.user.username}`
            );
            return;
        }

        const roomId = socket.roomId;
        const userId = socket.user._id.toString();
        const key = getTimerKey(roomId, userId);

        // Cancel any existing timer for this user and room.
        cancelDisconnectTimer(roomId, userId);

        const timer = setTimeout(async () => {
            disconnectTimers.delete(key);

            try {
                // Another tab or a reconnected socket may
                // still be present.
                if (await hasActiveSocket(io, roomId, userId)) {
                    return;
                }

                const room = await Room.findById(roomId);

                if (!room) {
                    await User.updateOne(
                        {
                            _id: userId,
                            currentRoom: roomId
                        },
                        {
                            $set: { currentRoom: null }
                        }
                    );
                    return;
                }

                // Keep membership during the rating window.
                // The expiry cleanup will remove it later.
                if (room.status === "ENDED") {
                    return;
                }

                if (room.status !== "ACTIVE") {
                    return;
                }

                const previousHostId =
                    room.currentHost?.toString();

                const result = await removeRoomMember(
                    roomId,
                    userId
                );

                if (!result.removed) {
                    return;
                }

                io.to(roomId).emit("member-left", {
                    id: userId,
                    username: socket.user.username
                });

                if (result.deleted) {
                    io.to(roomId).emit("room-deleted", {
                        roomId
                    });
                }
                else if (
                    previousHostId === userId &&
                    result.newHostId
                ) {
                    const nextHost = await User.findById(
                        result.newHostId
                    ).select("username");

                    if (nextHost) {
                        io.to(roomId).emit("host-changed", {
                            id: nextHost._id.toString(),
                            username: nextHost.username
                        });
                    }
                }

                console.log(
                    `${socket.user.username} removed after disconnect grace period`
                );

            } catch (err) {
                console.error(
                    "Socket disconnect cleanup error:",
                    err.message
                );
            }
        }, DISCONNECT_GRACE_MS);

        disconnectTimers.set(key, timer);
    });
};
