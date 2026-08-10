const Movie = require("../models/Movie");

const getMovies = async (req, res) => {
    try {
        const movies = await Movie.find({
            isActive: true
        }).select(
            "title description duration thumbnail averageRating"
        );
        res.status(200).json({
            movies
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const addMovie = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            thumbnail,
            videoUrl
        } = req.body;
        if (
            !title ||
            !description ||
            !duration ||
            !thumbnail ||
            !videoUrl
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });

        }
        const existingMovie = await Movie.findOne({
            title
        });
        if (existingMovie) {
            return res.status(400).json({
                message: "Movie already exists."
            });
        }
        const movie = await Movie.create({
            title,
            description,
            duration,
            thumbnail,
            videoUrl
        });
        res.status(201).json({
            message: "Movie added successfully.",
            movie
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }
        const allowedFields = [
            "title",
            "description",
            "duration",
            "thumbnail",
            "videoUrl"
        ];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                movie[field] = req.body[field];
            }
        });
        await movie.save();
        res.status(200).json({
            message: "Movie updated successfully.",
            movie
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }
        movie.isActive = false;
        await movie.save();
        res.status(200).json({
            message: "Movie deleted successfully."
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

const getTopRatedMovies = async (req, res) => {
    try {
        const movies = await Movie.find({
            isActive: true,
            totalRatings: {
                $gt: 0
            }
        })
        .sort({
            averageRating: -1
        })
        .limit(10)
        .select(
            "title averageRating totalRatings thumbnail"
        );
        res.status(200).json({
            movies
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    getMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getTopRatedMovies
};