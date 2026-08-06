const mongoose = require("mongoose");

const roomMemberSchema = new mongoose.Schema(
{
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

roomMemberSchema.index(
    { roomId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model("RoomMember", roomMemberSchema);