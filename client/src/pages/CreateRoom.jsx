import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMovies } from "../api/movieApi";
import { createRoom } from "../api/roomApi";

function CreateRoom() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const movieIdFromUrl = searchParams.get("movieId");

    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(
        movieIdFromUrl || ""
    );

    const [roomName, setRoomName] = useState("");
    const [maxMembers, setMaxMembers] = useState(5);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");

    const [createdRoom, setCreatedRoom] = useState(null);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                const data = await getMovies();
                setMovies(data.movies);
            } catch (err) {
                setError(err.message);
            } finally {
                setPageLoading(false);
            }
        };

        loadMovies();
    }, []);

    const handleCreateRoom = async (e) => {
        e.preventDefault();

        if (!selectedMovie) {
            setError("Please select a movie.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const data = await createRoom(
                roomName,
                selectedMovie,
                Number(maxMembers)
            );

            setCreatedRoom(data.room);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="page">
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Loading movies...</p>
                </div>
            </div>
        );
    }

    return (
    <div className="create-room-page">

        <div className="create-room-glow"></div>

        <div className="create-room-container">

            <div className="create-room-heading">

                <p className="create-room-label">
                    START A WATCH PARTY
                </p>

                <h1>
                    Create your
                    <br />
                    <span>perfect movie night.</span>
                </h1>

                <p>
                    Choose a movie, set your room size,
                    and invite your friends to watch together.
                </p>

            </div>

            {!createdRoom ? (

                <form
                    className="create-room-card"
                    onSubmit={handleCreateRoom}
                >

                    <div className="form-section">

                        <label>
                            MOVIE
                        </label>

                        <select
                            value={selectedMovie}
                            onChange={(e) =>
                                setSelectedMovie(e.target.value)
                            }
                            required
                        >
                            <option value="">
                                Select a movie
                            </option>

                            {movies.map((movie) => (
                                <option
                                    key={movie._id}
                                    value={movie._id}
                                >
                                    {movie.title}
                                </option>
                            ))}

                        </select>

                    </div>

                    <div className="form-section">

                        <label>
                            ROOM NAME
                        </label>

                        <input
                            type="text"
                            placeholder="Enter room name"
                            value={roomName}
                            onChange={(e) =>
                                setRoomName(e.target.value)
                            }
                            required
                        />

                    </div>

                    <div className="form-section">

                        <label>
                            MAXIMUM MEMBERS
                        </label>

                        <input
                            type="number"
                            min="2"
                            max="50"
                            value={maxMembers}
                            onChange={(e) =>
                                setMaxMembers(e.target.value)
                            }
                            required
                        />

                        <span className="input-hint">
                            Choose how many people can join your room.
                        </span>

                    </div>

                    <button
                        type="submit"
                        className="create-room-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Watch Party →"
                        }
                    </button>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                </form>

            ) : (

                <div className="room-created-card">

                    <div className="success-icon">
                        ✓
                    </div>

                    <p className="create-room-label">
                        YOUR WATCH PARTY IS READY
                    </p>

                    <h1>
                        Room created!
                    </h1>

                    <p>
                        Share this code with your friends
                        and get the movie started.
                    </p>

                    <div className="room-code-box">

                        <span>
                            ROOM CODE
                        </span>

                        <strong>
                            {createdRoom.roomCode}
                        </strong>

                    </div>

                    <button
                        className="create-room-submit"
                        onClick={() =>
                            navigate(
                                `/room/${createdRoom.roomCode}`
                            )
                        }
                    >
                        Enter Watch Party →
                    </button>

                </div>

            )}

        </div>

    </div>
);
}

export default CreateRoom;
