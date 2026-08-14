const Rating = require("../models/Rating");
const Movie = require("../models/Movie");
const Room = require("../models/Room");
const RoomMember = require("../models/RoomMember");

const rateMovie = async (req, res) => {
    try {
        const { movieId, roomId, rating } = req.body;

        // Validate input
        if (!movieId || !roomId || rating === undefined) {
            return res.status(400).json({
                message: "Movie ID, room ID and rating are required."
            });
        }

        // Validate rating
        if (
            typeof rating !== "number" ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });
        }

        // Check movie
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        // Check room
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found."
            });
        }

        // Rating should only be allowed after room ends
        if (room.status !== "ENDED") {
            return res.status(400).json({
                message: "You can rate the movie only after the room ends."
            });
        }

        const roomMember = await RoomMember.findOne({
            roomId,
            userId: req.user._id
        });

        if (!roomMember) {
            return res.status(403).json({
                message: "You were not a member of this room."
            });
        }

        // Make sure this room belongs to this movie
        if (!room.movieId.equals(movieId)) {
            return res.status(400).json({
                message: "This movie was not played in this room."
            });
        }

        // Check whether user has already rated this movie in this room
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

        // Create rating
        const newRating = await Rating.create({
            userId: req.user._id,
            movieId,
            roomId,
            rating
        });

        // Update movie statistics
        movie.totalStars += rating;
        movie.totalRatings += 1;

        movie.averageRating =
            movie.totalStars / movie.totalRatings;

        await movie.save();

        res.status(201).json({
            message: "Movie rated successfully.",
            rating: newRating,
            averageRating: movie.averageRating,
            totalRatings: movie.totalRatings
        });
    }
    catch (err) {
        console.error("Rating error:", err);

        res.status(500).json({
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

        res.status(200).json({
            movie
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};


module.exports = {
    rateMovie,
    getMovieRatings
};