
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Movie = require("../models/Movie");
const User = require("../models/User");

const {
    deleteRoomData,
    removeRoomMember
} = require("../utils/roomCleanup");

const generateRoomCode = async () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomCode = "";
    let exists = true;

    while (exists) {
        roomCode = "";

        for (let i = 0; i < 6; i++) {
            roomCode += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        exists = await Room.findOne({ roomCode });
    }

    return roomCode;
};

// Clear stale currentRoom references for ended or deleted rooms.
const clearStaleRoom = async (user) => {
    const freshUser = await User.findById(user._id);

    if (!freshUser.currentRoom) {
        return false;
    }

    const room = await Room.findById(freshUser.currentRoom);

    if (!room || room.status === "DELETED") {
        await User.updateOne(
            {
                _id: user._id,
                currentRoom: freshUser.currentRoom
            },
            { $set: { currentRoom: null } }
        );

        return false;
    }

    // Keep ENDED rooms until rating or expiry.
    return true;
};

const createRoom = async (req, res) => {
    try {
        const {
            roomName,
            movieId,
            maxMembers
        } = req.body;

        if (!roomName || !movieId || !maxMembers) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const alreadyInRoom = await clearStaleRoom(req.user);

        if (alreadyInRoom) {
            return res.status(400).json({
                message: "You are already in a room."
            });
        }

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        const roomCode = await generateRoomCode();

        const room = await Room.create({
            roomCode,
            roomName,
            movieId,
            originalHost: req.user._id,
            currentHost: req.user._id,
            maxMembers,
            currentMembers: 1
        });

        await Movie.findByIdAndUpdate(
            movieId,
            {
                $inc: {
                    totalStreams: 1
                }
            }
        );

        await RoomMember.create({
            roomId: room._id,
            userId: req.user._id
        });

        await User.findByIdAndUpdate(
            req.user._id,
            {
                currentRoom: room._id
            }
        );

        res.status(201).json({
            message: "Room created successfully.",
            room: {
                id: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName,
                maxMembers: room.maxMembers,
                currentMembers: room.currentMembers
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.body;

        if (!roomCode) {
            return res.status(400).json({
                message: "Room code is required."
            });
        }

        const alreadyInRoom = await clearStaleRoom(req.user);

        if (alreadyInRoom) {
            return res.status(400).json({
                message: "You are already in a room."
            });
        }

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        if (room.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Room is no longer active."
            });
        }

        if (room.currentMembers >= room.maxMembers) {
            return res.status(400).json({
                message: "Room is full."
            });
        }

        let roomMember = await RoomMember.findOne({
            roomId: room._id,
            userId: req.user._id
        });

        if (roomMember) {
            if (roomMember.isActive) {
                return res.status(400).json({
                    message: "You are already in this room."
                });
            }

            roomMember.isActive = true;
            roomMember.joinedAt = new Date();
            roomMember.leftAt = null;
            await roomMember.save();
        }
        else {
            await RoomMember.create({
                roomId: room._id,
                userId: req.user._id,
                joinedAt: new Date(),
                isActive: true
            });
        }

        if (!room.currentHost) {
            room.currentHost = req.user._id;
        }

        room.currentMembers++;
        await room.save();

        await User.findByIdAndUpdate(
            req.user._id,
            {
                currentRoom: room._id
            }
        );

        res.status(200).json({
            message: "Joined room successfully.",
            room: {
                roomId: room._id,
                roomCode: room.roomCode,
                roomName: room.roomName,
                currentMembers: room.currentMembers,
                maxMembers: room.maxMembers
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const leaveRoom = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.currentRoom) {
            return res.status(400).json({
                message: "You are not in any room."
            });
        }

        const roomId = user.currentRoom;
        const room = await Room.findById(roomId);

        if (!room) {
            await User.updateOne(
                { _id: user._id },
                { $set: { currentRoom: null } }
            );

            return res.status(200).json({
                message: "Left room successfully."
            });
        }

        const oldHostId = room.currentHost?.toString();

        const result = await removeRoomMember(
            roomId,
            user._id
        );

        const io = req.app.get("io");

        if (io) {
            io.to(roomId.toString()).emit("member-left", {
                id: user._id.toString(),
                username: user.username
            });

            if (result.deleted) {
                io.to(roomId.toString()).emit("room-deleted", {
                    roomId: roomId.toString()
                });
            }
            else if (
                oldHostId === user._id.toString() &&
                result.newHostId
            ) {
                const nextHost = await User.findById(
                    result.newHostId
                ).select("username");

                if (nextHost) {
                    io.to(roomId.toString()).emit(
                        "host-changed",
                        {
                            id: nextHost._id.toString(),
                            username: nextHost.username
                        }
                    );
                }
            }
        }

        res.status(200).json({
            message: "Left room successfully."
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


const getRoom = async (req, res) => {
    try {
        const room = await Room.findOne({
            roomCode: req.params.roomCode.toUpperCase()
        })
            .populate("movieId")
            .populate("currentHost", "username");

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        // Only active members can access the room.
        const member = await RoomMember.findOne({
            roomId: room._id,
            userId: req.user._id,
            isActive: true
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this room."
            });
        }

        // Reject rooms whose rating window has expired.
        if (
            room.status === "DELETED" ||
            (
                room.status === "ENDED" &&
                (!room.deleteAt || room.deleteAt <= new Date())
            )
        ) {
            return res.status(410).json({
                message: "This room is no longer available."
            });
        }

        return res.status(200).json({
            _id: room._id,
            roomCode: room.roomCode,
            roomName: room.roomName,

            // Required for restoring the rating modal.
            status: room.status,
            deleteAt: room.deleteAt,

            movie: {
                _id: room.movieId._id,
                title: room.movieId.title,
                description: room.movieId.description,
                duration: room.movieId.duration,
                thumbnail: room.movieId.thumbnail,
                videoUrl: room.movieId.videoUrl
            },

            // Keep the existing host field.
            host: room.currentHost,

            currentMembers: room.currentMembers,
            maxMembers: room.maxMembers,

            playback: {
                isPlaying: room.isPlaying,
                currentTime: room.currentTime
            }
        });

    } catch (err) {
        console.error("Get room error:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};


const getRoomMembers = async (req, res) => {
    try {
        const room = await Room.findOne({
            roomCode: req.params.roomCode.toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        const members = await RoomMember.find({
            roomId: room._id,
            isActive: true
        }).populate("userId", "username");

        const response = members.map(member => ({
            username: member.userId.username,
            isHost: Boolean(
                room.currentHost &&
                room.currentHost.equals(member.userId._id)
            ),
            joinedAt: member.joinedAt,
            isActive: member.isActive
        }));

        res.status(200).json({
            members: response
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const kickMember = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required."
            });
        }

        const user = await User.findById(req.user._id);

        if (!user.currentRoom) {
            return res.status(400).json({
                message: "You are not in a room."
            });
        }

        const room = await Room.findById(user.currentRoom);

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        if (
            !room.currentHost ||
            !room.currentHost.equals(user._id)
        ) {
            return res.status(403).json({
                message: "Only the current host can remove members."
            });
        }

        if (user._id.equals(userId)) {
            return res.status(400).json({
                message: "Use Leave Room instead."
            });
        }

        if (room.originalHost.equals(userId)) {
            return res.status(400).json({
                message: "Original host cannot be removed."
            });
        }

        const member = await RoomMember.findOne({
            roomId: room._id,
            userId,
            isActive: true
        });

        if (!member) {
            return res.status(404).json({
                message: "Member not found."
            });
        }

        const result = await removeRoomMember(
            room._id,
            userId
        );

        const io = req.app.get("io");

        if (io) {
            io.to(room._id.toString()).emit(
                "member-kicked",
                {
                    userId: userId.toString()
                }
            );

            if (result.deleted) {
                io.to(room._id.toString()).emit(
                    "room-deleted",
                    {
                        roomId: room._id.toString()
                    }
                );
            }
        }

        res.status(200).json({
            message: "Member removed successfully."
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.currentRoom) {
            return res.status(400).json({
                message: "You are not in a room."
            });
        }

        const room = await Room.findById(user.currentRoom);

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        if (
            !room.currentHost ||
            !room.currentHost.equals(user._id)
        ) {
            return res.status(403).json({
                message: "Only the current host can delete the room."
            });
        }

        const roomId = room._id;
        const io = req.app.get("io");

        if (io) {
            io.to(roomId.toString()).emit(
                "room-deleted",
                {
                    roomId: roomId.toString()
                }
            );
        }

        await deleteRoomData(roomId);

        res.status(200).json({
            message: "Room deleted successfully."
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    getRoomMembers,
    kickMember,
    deleteRoom
};
