
const Rating = require("../models/Rating");
const Movie = require("../models/Movie");
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");

const { removeRoomMember } = require("../utils/roomCleanup");

const rateMovie = async (req, res) => {
    try {
        const { movieId, roomId, rating } = req.body;

        if (!movieId || !roomId || rating === undefined) {
            return res.status(400).json({
                message: "Movie ID, room ID and rating are required."
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be a whole number between 1 and 5."
            });
        }

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        if (room.status !== "ENDED") {
            return res.status(400).json({
                message: "You can rate the movie only after the room ends."
            });
        }

        if (!room.deleteAt || room.deleteAt <= new Date()) {
            return res.status(400).json({
                message: "The rating period has expired."
            });
        }

        if (!room.movieId.equals(movieId)) {
            return res.status(400).json({
                message: "This movie was not played in this room."
            });
        }

        const member = await RoomMember.findOne({
            roomId,
            userId: req.user._id,
            isActive: true
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not an active member of this room."
            });
        }

        const existingRating = await Rating.findOne({
            userId: req.user._id,
            movieId,
            roomId
        });

        if (existingRating) {
            return res.status(400).json({
                message: "You have already rated this movie."
            });
        }

        const newRating = await Rating.create({
            userId: req.user._id,
            movieId,
            roomId,
            rating
        });

        // Atomically update totalStars, totalRatings,
        // and averageRating in a single MongoDB operation.
        const updatedMovie = await Movie.findByIdAndUpdate(
    movieId,
    {
        $inc: {
            totalStars: rating,
            totalRatings: 1
        }
    },
    { new: true }
);

updatedMovie.averageRating =
    updatedMovie.totalStars / updatedMovie.totalRatings;

await updatedMovie.save();

        await removeRoomMember(
            room._id,
            req.user._id
        );

        return res.status(201).json({
            message: "Movie rated successfully.",
            rating: newRating,
            averageRating: updatedMovie.averageRating,
            totalRatings: updatedMovie.totalRatings
        });

    } catch (err) {
        console.error("Rating error:", err);

        if (err.code === 11000) {
            return res.status(400).json({
                message: "You have already rated this movie."
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

const getMovieRatings = async (req, res) => {
    try {
        const { movieId } = req.params;

        const movie = await Movie.findById(movieId).select(
            "title totalStars totalRatings averageRating"
        );

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        return res.status(200).json({ movie });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    rateMovie,
    getMovieRatings
};
