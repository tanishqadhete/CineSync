
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");
const User = require("../models/User");
const Message = require("../models/Message");

// Delete temporary room data.
// Keep Rating documents and Movie statistics.
const deleteRoomData = async (roomId) => {
    await User.updateMany(
        { currentRoom: roomId },
        { $set: { currentRoom: null } }
    );

    await RoomMember.deleteMany({ roomId });

    await Message.deleteMany({ roomId });

    await Room.findByIdAndDelete(roomId);
};

// Remove one member from a room.
const removeRoomMember = async (roomId, userId) => {
    const member = await RoomMember.findOneAndUpdate(
        {
            roomId,
            userId,
            isActive: true
        },
        {
            $set: {
                isActive: false,
                leftAt: new Date()
            }
        },
        { new: true }
    );

    // Clear currentRoom only if it still refers
    // to the room being left.
    await User.updateOne(
        {
            _id: userId,
            currentRoom: roomId
        },
        {
            $set: { currentRoom: null }
        }
    );

    if (!member) {
        return {
            removed: false,
            deleted: false
        };
    }

    const room = await Room.findById(roomId);

    if (!room) {
        return {
            removed: true,
            deleted: false
        };
    }

    const remainingMembers = await RoomMember.find({
        roomId,
        isActive: true
    }).sort({ joinedAt: 1 });

    if (remainingMembers.length === 0) {
        await deleteRoomData(roomId);

        return {
            removed: true,
            deleted: true
        };
    }

    room.currentMembers = remainingMembers.length;

    if (
        room.currentHost &&
        room.currentHost.toString() === userId.toString()
    ) {
        room.currentHost = remainingMembers[0].userId;
    }

    await room.save();

    return {
        removed: true,
        deleted: false,
        newHostId: room.currentHost
    };
};

// Clean up ended rooms after their rating deadline.
const cleanupExpiredRooms = async () => {
    const expiredRooms = await Room.find({
        status: "ENDED",
        deleteAt: { $lte: new Date() }
    }).select("_id");

    for (const room of expiredRooms) {
        await deleteRoomData(room._id);
    }
};

module.exports = {
    deleteRoomData,
    removeRoomMember,
    cleanupExpiredRooms
};
