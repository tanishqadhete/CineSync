import "../styles/dashboard.css";
import "../styles/admin.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getAdminMovies,
    getMovieStats,
    addMovie,
    deleteMovie
} from "../api/adminApi";


function AdminDashboard() {

    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [stats, setStats] = useState([]);

    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showAddMovie, setShowAddMovie] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration: "",
        thumbnail: "",
        videoUrl: ""
    });


    /*
    =========================
    CHECK ADMIN
    =========================
    */

    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (!user || user.role !== "ADMIN") {
            navigate("/dashboard");
            return;
        }

        loadDashboard();

    }, [navigate]);


    /*
    =========================
    LOAD DASHBOARD
    =========================
    */

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                movieData,
                statsData
            ] = await Promise.all([
                getAdminMovies(),
                getMovieStats()
            ]);

            setMovies(movieData.movies || []);
            setStats(statsData.movies || []);

        }
        catch (err) {

            setError(
                err.message ||
                "Unable to load admin dashboard."
            );

        }
        finally {

            setLoading(false);

        }

    };


    /*
    =========================
    FORM HANDLING
    =========================
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    /*
    =========================
    ADD MOVIE
    =========================
    */

    const handleAddMovie = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setAdding(true);

        try {

            const data = await addMovie({
                title: formData.title.trim(),
                description: formData.description.trim(),
                duration: Number(formData.duration),
                thumbnail: formData.thumbnail.trim(),
                videoUrl: formData.videoUrl.trim()
            });

            setSuccess(
                data.message ||
                "Movie added successfully."
            );

            setFormData({
                title: "",
                description: "",
                duration: "",
                thumbnail: "",
                videoUrl: ""
            });

            setShowAddMovie(false);

            await loadDashboard();

        }
        catch (err) {

            setError(
                err.message ||
                "Unable to add movie."
            );

        }
        finally {

            setAdding(false);

        }

    };


    /*
    =========================
    DELETE MOVIE
    =========================
    */

    const handleDeleteMovie = async (movieId) => {

        const confirmed = window.confirm(
            "Are you sure you want to remove this movie?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");

        try {

            const data = await deleteMovie(movieId);

            setSuccess(
                data.message ||
                "Movie removed successfully."
            );

            await loadDashboard();

        }
        catch (err) {

            setError(
                err.message ||
                "Unable to remove movie."
            );

        }

    };


    /*
    =========================
    LOGOUT
    =========================
    */

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");

    };


    /*
    =========================
    GET STATS FOR MOVIE
    =========================
    */

    const getStatsForMovie = (movieId) => {

        return stats.find(
            (movie) =>
                movie._id === movieId
        );

    };


    /*
    =========================
    LOADING
    =========================
    */

    if (loading) {

        return (
            <div className="admin-page">

                <div className="admin-loading">
                    Loading admin dashboard...
                </div>

            </div>
        );

    }


    return (
        <div className="admin-page dashboard">

            <div className="dashboard-glow" />

            {/* =========================
                HEADER
            ========================= */}

            <header className="dashboard-header admin-header">

                <div className="brand">Cine<span>Sync</span></div>


                <button
                    className="logout-button admin-logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="admin-content dashboard-content">


                {/* =========================
                    PAGE INTRO
                ========================= */}

                <section className="admin-intro hero-section">

                    <div>

                        <p className="hero-label admin-label">
                            MOVIE MANAGEMENT
                        </p>

                        <h1>
                            Manage your
                            <br />
                            <span>CineSync library.</span>
                        </h1>

                        <p className="hero-description">
                            Add movies, monitor streams,
                            and keep track of audience ratings.
                        </p>

                    </div>


                    <button
                        className="add-movie-button"
                        onClick={() =>
                            setShowAddMovie(
                                (prev) => !prev
                            )
                        }
                    >
                        {showAddMovie
                            ? "Close"
                            : "+ Add Movie"
                        }
                    </button>

                </section>


                {/* =========================
                    MESSAGES
                ========================= */}

                {error && (
                    <div className="admin-message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="admin-message success">
                        {success}
                    </div>
                )}


                {/* =========================
                    ADD MOVIE FORM
                ========================= */}

                {showAddMovie && (

                    <section className="admin-card add-movie-card">

                        <div className="admin-card-header">

                            <div>

                                <p className="admin-card-label">
                                    NEW MOVIE
                                </p>

                                <h2>
                                    Add a movie
                                </h2>

                            </div>

                        </div>


                        <form
                            className="admin-movie-form"
                            onSubmit={handleAddMovie}
                        >

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label>
                                        TITLE
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Movie title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label>
                                        DURATION
                                    </label>

                                    <input
                                        type="number"
                                        name="duration"
                                        placeholder="Duration in minutes"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    DESCRIPTION
                                </label>

                                <textarea
                                    name="description"
                                    placeholder="Enter movie description..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                />

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    THUMBNAIL URL
                                </label>

                                <input
                                    type="url"
                                    name="thumbnail"
                                    placeholder="https://..."
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="admin-form-group">

                                <label>
                                    VIDEO URL
                                </label>

                                <input
                                    type="url"
                                    name="videoUrl"
                                    placeholder="https://..."
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <button
                                type="submit"
                                className="save-movie-button"
                                disabled={adding}
                            >
                                {adding
                                    ? "Adding movie..."
                                    : "Add Movie"
                                }
                            </button>

                        </form>

                    </section>

                )}


                {/* =========================
                    STATISTICS
                ========================= */}

                <section className="admin-stat-grid">


                    <div className="admin-stat-card">

                        <span className="admin-stat-label">
                            TOTAL MOVIES
                        </span>

                        <strong>
                            {movies.length}
                        </strong>

                    </div>


                    <div className="admin-stat-card">

                        <span className="admin-stat-label">
                            TOTAL STREAMS
                        </span>

                        <strong>
                            {stats.reduce(
                                (total, movie) =>
                                    total +
                                    (movie.totalStreams || 0),
                                0
                            )}
                        </strong>

                    </div>


                    <div className="admin-stat-card">

                        <span className="admin-stat-label">
                            TOTAL RATINGS
                        </span>

                        <strong>
                            {stats.reduce(
                                (total, movie) =>
                                    total +
                                    (movie.totalRatings || 0),
                                0
                            )}
                        </strong>

                    </div>


                    <div className="admin-stat-card">

                        <span className="admin-stat-label">
                            AVERAGE RATING
                        </span>

                        <strong>

                            {(() => {
                                const ratedMovies = stats.filter(
                                    (movie) => Number(movie.averageRating) > 0
                                );
                                if (!ratedMovies.length) return "0.0";
                                const average = ratedMovies.reduce(
                                    (total, movie) => total + Number(movie.averageRating), 0
                                ) / ratedMovies.length;
                                return average.toFixed(1);
                            })()}
                            <small>★</small>
                        </strong>

                    </div>

                </section>


                {/* =========================
                    MOVIE LIST
                ========================= */}

                <section className="admin-card movie-management">

                    <div className="admin-card-header">

                        <div>

                            <p className="admin-card-label">
                                LIBRARY
                            </p>

                            <h2>
                                Movies
                            </h2>

                        </div>

                        <span className="movie-count">
                            {movies.length} movies
                        </span>

                    </div>


                    {movies.length === 0 ? (

                        <div className="no-movies">
                            No movies found.
                        </div>

                    ) : (

                        <div className="movie-table-wrapper">

                            <table className="movie-table">

                                <thead>

                                    <tr>

                                        <th>
                                            MOVIE
                                        </th>

                                        <th>
                                            STREAMS
                                        </th>

                                        <th>
                                            RATINGS
                                        </th>

                                        <th>
                                            RATING
                                        </th>

                                        <th>
                                            ACTION
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {movies.map((movie) => {

                                        const movieStats =
                                            getStatsForMovie(
                                                movie._id
                                            );

                                        return (

                                            <tr
                                                key={movie._id}
                                            >

                                                <td>

                                                    <div className="movie-info">

                                                        <img
                                                            src={
                                                                movie.thumbnail
                                                            }
                                                            alt={
                                                                movie.title
                                                            }
                                                            className="movie-thumbnail"
                                                        />

                                                        <div>

                                                            <strong>
                                                                {movie.title}
                                                            </strong>

                                                            <span>
                                                                {movie.duration}
                                                                {" "}
                                                                min
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    {movieStats?.totalStreams ||
                                                        movie.totalStreams ||
                                                        0}

                                                </td>


                                                <td>

                                                    {movieStats?.totalRatings ||
                                                        movie.totalRatings ||
                                                        0}

                                                </td>


                                                <td>

                                                    <span className="rating-value">

                                                        ★

                                                        {(
                                                            movieStats?.averageRating ??
                                                            movie.averageRating ??
                                                            0
                                                        ).toFixed(1)}

                                                    </span>

                                                </td>


                                                <td>

                                                  

                                                        <button
                                                            className="delete-movie-button"
                                                            onClick={() =>
                                                                handleDeleteMovie(
                                                                    movie._id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


            </main>

        </div>
    );
}


export default AdminDashboard;
