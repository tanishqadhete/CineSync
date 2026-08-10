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
        <div className="page">

            <h1>Join Room</h1>

            <form
                className="room-form"
                onSubmit={handleJoinRoom}
            >

                <label>
                    Room Code
                </label>

                <input
                    type="text"
                    placeholder="Enter room code"
                    value={roomCode}
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
                        : "Join Room"
                    }
                </button>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

            </form>

        </div>
    );
}

export default JoinRoom;