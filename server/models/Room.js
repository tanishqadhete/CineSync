const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
{
    roomCode: {
        type: String,
        required: true,
        unique: true
    },
    roomName: {
        type: String,
        required: true,
        trim: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    originalHost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    currentHost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    maxMembers: {
        type: Number,
        required: true,
        min: 2,
        max: 50
    },
    currentMembers: {
        type: Number,
        default: 0
    },
    currentTime: {
        type: Number,
        default: 0
    },
    isPlaying: {
        type: Boolean,
        default: false
    },
    playbackUpdatedAt: {
        type: Date,
        default: Date.now
    },
    playbackVersion: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["ACTIVE", "ENDED", "DELETED"],
        default: "ACTIVE"
    },
    deleteAt: {
        type: Date,
        default: null,
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Room", roomSchema);