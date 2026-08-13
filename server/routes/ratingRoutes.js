const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
rateMovie,
getMovieRatings
} = require("../controllers/ratingController");

// Rate a movie
router.post(
"/",
authMiddleware,
rateMovie
);

// Get movie rating statistics
router.get(
"/movie/:movieId",
authMiddleware,
getMovieRatings
);

module.exports = router;
