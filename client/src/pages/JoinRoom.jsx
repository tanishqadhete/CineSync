import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinRoom } from "../api/roomApi";

function JoinRoom() {
const navigate = useNavigate();

const [roomCode, setRoomCode] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleJoinRoom = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        const data = await joinRoom(roomCode);
        navigate(`/room/${data.room.roomCode}`);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

return (
    <div className="join-room-page">

        <div className="room-page-glow"></div>

        <div className="room-page-content">

            <p className="room-page-label">
                JOIN THE WATCH PARTY
            </p>

            <h1>
                Watch together.
                <br />
                <span>Don't miss a moment.</span>
            </h1>

            <p className="room-page-description">
                Enter the room code shared by your friend
                and jump straight into the movie.
            </p>

            <form
                className="room-form join-room-form"
                onSubmit={handleJoinRoom}
            >

                <label>
                    ROOM CODE
                </label>

                <input
                    type="text"
                    placeholder="e.g. O812QY"
                    value={roomCode}
                    maxLength={6}
                    onChange={(e) =>
                        setRoomCode(
                            e.target.value.toUpperCase()
                        )
                    }
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Joining..."
                        : "Join Watch Party →"
                    }
                </button>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

            </form>

            <p className="room-page-footer">
                One code. One movie. Everyone together.
            </p>

        </div>

    </div>
);

}

export default JoinRoom;
