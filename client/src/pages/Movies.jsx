import { useEffect, useState } from "react";
import { getMovies } from "../api/movieApi";
import { useNavigate } from "react-router-dom";

function Movies() {
const navigate = useNavigate();

const [movies, setMovies] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    const fetchMovies = async () => {
        try {
            const data = await getMovies();
            setMovies(data.movies);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchMovies();
}, []);

if (loading) {
    return (
        <div className="page movies-page">
            <div className="movies-loading">
                <div className="loading-spinner"></div>
                <p>Loading your movies...</p>
            </div>
        </div>
    );
}

return (
    <div className="page movies-page">

        <div className="movies-glow"></div>

        <div className="movies-header">

            <div>
                <p className="movies-label">
                    CINESYNC LIBRARY
                </p>

                <h1>
                    Pick your next
                    <span> movie night.</span>
                </h1>

                <p className="movies-description">
                    Choose a movie, start a watch party,
                    and bring your friends along.
                </p>
            </div>

            <button
                className="movies-back-button"
                onClick={() => navigate("/dashboard")}
            >
                ← Dashboard
            </button>

        </div>

        {error && (
            <p className="error">
                {error}
            </p>
        )}

        {movies.length === 0 ? (
            <div className="empty-movies">
                <h2>No movies available</h2>
                <p>
                    There aren't any movies in the library yet.
                </p>
            </div>
        ) : (

            <div className="movie-grid">

                {movies.map((movie) => (

                    <div
                        className="movie-card"
                        key={movie._id}
                    >

                        <div className="movie-poster">

                            <img
                                src={movie.thumbnail}
                                alt={movie.title}
                            />

                            <div className="movie-overlay">
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/create-room?movieId=${movie._id}`
                                        )
                                    }
                                >
                                    Start Watch Party →
                                </button>
                            </div>

                        </div>

                        <div className="movie-info">

                            <div className="movie-title-row">

                                <h3>
                                    {movie.title}
                                </h3>

                                <span className="movie-rating">
                                    ★ {movie.averageRating || 0}
                                </span>

                            </div>

                            <p>
                                {movie.description}
                            </p>

                        </div>

                    </div>

                ))}

            </div>

        )}

    </div>
);

}

export default Movies;
