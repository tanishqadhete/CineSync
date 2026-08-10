const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getMovies,
    addMovie,
    updateMovie,
    deleteMovie,
    getTopRatedMovies
} = require("../controllers/movieController");

router.get("/", authMiddleware, getMovies);
router.get("/top-rated", authMiddleware, adminMiddleware, getTopRatedMovies);
router.post("/", authMiddleware, adminMiddleware, addMovie);
router.put("/:movieId", authMiddleware, adminMiddleware, updateMovie);
router.delete("/:movieId", authMiddleware, adminMiddleware, deleteMovie);

module.exports = router;