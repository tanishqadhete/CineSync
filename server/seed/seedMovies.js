require("dotenv").config();
const connectDB = require("../config/db");
const Movie = require("../models/Movie");

const seedMovies = async () => {
    try {
        await connectDB();
        await Movie.deleteMany({});
        await Movie.insertMany([
            {
                title: "Interstellar",
                description: "A team of explorers travel through a wormhole in space to save humanity.",
                duration: 169,
                thumbnail: "https://example.com/interstellar.jpg",
                videoUrl: "https://example.com/interstellar.mp4",
                totalStars: 0,
                totalRatings: 0,
                averageRating: 0,
                isActive: true
            },
            {
                title: "Inception",
                description: "A thief enters people's dreams to steal secrets.",
                duration: 148,
                thumbnail: "https://example.com/inception.jpg",
                videoUrl: "https://example.com/inception.mp4",
                totalStars: 0,
                totalRatings: 0,
                averageRating: 0,
                isActive: true
            },
            {
                title: "The Dark Knight",
                description: "Batman faces the Joker in Gotham City.",
                duration: 152,
                thumbnail: "https://example.com/darkknight.jpg",
                videoUrl: "https://example.com/darkknight.mp4",
                totalStars: 0,
                totalRatings: 0,
                averageRating: 0,
                isActive: true
            },
            {
                title: "The Shawshank Redemption",
                description: "Two imprisoned men build an enduring friendship.",
                duration: 142,
                thumbnail: "https://example.com/shawshank.jpg",
                videoUrl: "https://example.com/shawshank.mp4",
                totalStars: 0,
                totalRatings: 0,
                averageRating: 0,
                isActive: true
            },
            {
                title: "Avengers: Endgame",
                description: "The Avengers assemble one final time against Thanos.",
                duration: 181,
                thumbnail: "https://example.com/endgame.jpg",
                videoUrl: "https://example.com/endgame.mp4",
                totalStars: 0,
                totalRatings: 0,
                averageRating: 0,
                isActive: true
            }
        ]);
        console.log("Movies seeded successfully.");
        process.exit();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

seedMovies();
