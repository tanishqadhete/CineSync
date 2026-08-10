const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const Movie = require("../models/Movie");
const User = require("../models/User");
const Message = require("../models/Message");

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

        if (req.user.currentRoom) {
            return res.status(400).json({
                message: "You are already in a room."
            });
        }

        const movie = await Movie.findById(movieId);
        if (!movie || !movie.isActive) {
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

        await RoomMember.create({
            roomId: room._id,
            userId: req.user._id,
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
        if (req.user.currentRoom) {
            return res.status(400).json({
                message: "You are already in a room."
            });
        }
        const room = await Room.findOne({ roomCode });
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
            if (
                room.originalHost &&
                room.originalHost.equals(req.user._id)
            ) {
                room.currentHost = req.user._id;
            }

        } else {
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
        if (!req.user.currentRoom) {
            return res.status(400).json({
                message: "You are not in any room."
            });
        }
        const room = await Room.findById(req.user.currentRoom);
        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }
        const roomMember = await RoomMember.findOne({
            roomId: room._id,
            userId: req.user._id,
            isActive: true
        });
        if (!roomMember) {
            return res.status(404).json({
                message: "Membership not found."
            });
        }
        roomMember.isActive = false;
        roomMember.leftAt = new Date();
        await roomMember.save();
        await User.findByIdAndUpdate(
            req.user._id,
            {
                currentRoom: null
            }
        );
        room.currentMembers--;
        if (
            room.currentHost &&
            room.currentHost.equals(req.user._id)
        ) {
            const nextHost = await RoomMember.findOne({
                roomId: room._id,
                isActive: true
            }).sort({ joinedAt: 1 });
            if (nextHost) {
                room.currentHost = nextHost.userId;
            }
            else {
                room.currentHost = null;
            }
        }
        await room.save();
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
            roomCode: req.params.roomCode
        })
        .populate("movieId")
        .populate("currentHost", "username");
        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }
        res.status(200).json({
            roomCode: room.roomCode,
            roomName: room.roomName,
            movie: {
                title: room.movieId.title,
                description: room.movieId.description,
                duration: room.movieId.duration,
                thumbnail: room.movieId.thumbnail,
                videoUrl: room.movieId.videoUrl
            },
            host: room.currentHost,
            currentMembers: room.currentMembers,
            maxMembers: room.maxMembers,
            playback: {
                isPlaying: room.isPlaying,
                currentTime: room.currentTime
            }
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const getRoomMembers = async (req, res) => {
    try {
        const room = await Room.findOne({
            roomCode: req.params.roomCode
        });
        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }
        const members = await RoomMember.find({
            roomId: room._id,
            isActive: true
        })
        .populate("userId", "username");
        const response = members.map(member => ({
            username: member.userId.username,
            isHost:
                room.currentHost &&
                room.currentHost.equals(member.userId._id),
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
        if (!req.user.currentRoom) {
            return res.status(400).json({
                message: "You are not in a room."
            });
        }
        const room = await Room.findById(req.user.currentRoom);
        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }
        if (
            !room.currentHost ||
            !room.currentHost.equals(req.user._id)
        ) {

            return res.status(403).json({
                message: "Only the current host can remove members."
            });
        }
        if (!room.currentHost.equals(req.user._id)) {
            return res.status(403).json({
                message: "Only the current host can remove members."
            });
        }
        if (req.user._id.equals(userId)) {
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
        member.isActive = false;
        member.leftAt = new Date();
        await member.save();
        await User.findByIdAndUpdate(
            userId,
            {
                currentRoom: null
            }
        );
        room.currentMembers--;
        await room.save();
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
        if (!req.user.currentRoom) {
            return res.status(400).json({
                message: "You are not in a room."
            });
        }
        const room = await Room.findById(req.user.currentRoom);
        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }
        if (
            !room.currentHost ||
            !room.currentHost.equals(req.user._id)
        ) {
            return res.status(403).json({
                message: "Only the current host can delete the room."
            });
        }
        await User.updateMany(
            {
                currentRoom: room._id
            },
            {
                $set: {
                    currentRoom: null
                }
            }
        );
        await RoomMember.updateMany(
            {
                roomId: room._id,
                isActive: true
            },
            {
                $set: {
                    isActive: false,
                    leftAt: new Date()
                }
            }
        );
        await Message.deleteMany({
            roomId: room._id
        });
        await Room.findByIdAndDelete(room._id);
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