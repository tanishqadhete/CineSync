const mongoose = require("mongoose");

const movieRatingSchema = new mongoose.Schema(
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
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    ratedAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

movieRatingSchema.index(
    { userId: 1, movieId: 1 },
    { unique: true }
);

module.exports = mongoose.model("MovieRating", movieRatingSchema);