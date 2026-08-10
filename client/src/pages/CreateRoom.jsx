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
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className="page">

            <h1>Create Room</h1>

            {!createdRoom ? (

                <form
                    className="room-form"
                    onSubmit={handleCreateRoom}
                >

                    <label>
                        Movie
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

                    <label>
                        Room Name
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

                    <label>
                        Maximum Members
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

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Room"
                        }
                    </button>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                </form>

            ) : (

                <div className="room-created">

                    <h2>Room Created 🎬</h2>

                    <p>
                        Your room code is:
                    </p>

                    <strong className="room-code">
                        {createdRoom.roomCode}
                    </strong>

                    <p>
                        Share this code with your friends.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/room/${createdRoom.roomCode}`
                            )
                        }
                    >
                        Enter Room
                    </button>

                </div>

            )}

        </div>
    );
}

export default CreateRoom;