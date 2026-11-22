
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Message = require("../models/Message");

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

    socket.on("join-room", async (roomCode) => {
        try {
            const room = await Room.findOne({
                roomCode: roomCode.toUpperCase(),
                status: "ACTIVE"
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
                    message: "Room not found."
                });
            }

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
            })
                .populate("userId", "username");

            const messages = await Message.find({
                roomId: room._id
            })
                .sort({
                    createdAt: 1
                })
                .populate("sender", "username");

            // Join Socket.IO room
            socket.join(room._id.toString());

            // Remember which room this socket belongs to
            socket.roomId = room._id.toString();

            // Use the same timestamp for playback position and serverTime
            const serverTime = Date.now();

            // Send initial room state to this user
            socket.emit("room-state", {
                isHost:
                    room.currentHost &&
                    room.currentHost._id.toString() ===
                        socket.user._id.toString(),

                room: {
                    _id: room._id,
                    roomCode: room.roomCode,
                    roomName: room.roomName,
                    maxMembers: room.maxMembers,
                    currentMembers: room.currentMembers,
                    currentHost: room.currentHost
                },

                movie: room.movieId,

                playback: {
                    currentTime: getPlaybackPosition(room, serverTime),
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

            // Tell everyone else that someone joined
            socket.to(room._id.toString()).emit(
                "member-joined",
                {
                    id: socket.user._id,
                    username: socket.user.username
                }
            );

            console.log(
                `${socket.user.username} joined socket room ${room.roomCode}`
            );

        } catch (err) {
            console.error(err);

            socket.emit("error-message", {
                message: "Unable to join room."
            });
        }
    });


    socket.on("disconnect", async () => {
        try {
            if (!socket.roomId) {
                console.log(
                    `User disconnected: ${socket.user.username}`
                );
                return;
            }

            const roomId = socket.roomId;

            const room = await Room.findById(roomId)
                .populate("currentHost", "username");

            if (!room) {
                return;
            }

            io.to(roomId).emit("member-left", {
                id: socket.user._id,
                username: socket.user.username
            });

            if (room.currentHost) {
                io.to(roomId).emit("host-changed", {
                    id: room.currentHost._id,
                    username: room.currentHost.username
                });
            }

            console.log(
                `${socket.user.username} disconnected from room ${room.roomCode}`
            );

        } catch (err) {
            console.error(
                "Socket disconnect error:",
                err.message
            );
        }
    });

};
