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
            <div className="page">
                <h2>Loading movies...</h2>
            </div>
        );
    }

    return (
        <div className="page">

            <h1>Movies</h1>

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <div className="movie-grid">

                {movies.map((movie) => (

                    <div
                        className="movie-card"
                        key={movie._id}
                    >

                        <img
                            src={movie.thumbnail}
                            alt={movie.title}
                        />

                        <div className="movie-info">

                            <h3>{movie.title}</h3>

                            <p>
                                {movie.description}
                            </p>

                            <span>
                                ⭐ {movie.averageRating || 0}
                            </span>

                            <button
                                className="create-room-button"
                                onClick={() =>
                                    navigate(
                                        `/create-room?movieId=${movie._id}`
                                    )
                                }
                            >
                                Create Room
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Movies;