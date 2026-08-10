const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },
    currentRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: null
    },
    avatar: {
        type: String,
        default: ""
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);