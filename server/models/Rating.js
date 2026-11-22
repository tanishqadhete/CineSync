const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        }
    },
    {
        timestamps: true
    }
);

ratingSchema.index(
    { userId: 1, roomId: 1, movieId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Rating", ratingSchema);