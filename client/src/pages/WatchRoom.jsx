import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, leaveRoom } from "../api/roomApi";
import socket from "../socket";

function WatchRoom() {
const { roomCode } = useParams();
const navigate = useNavigate();

const [room, setRoom] = useState(null);
const [movie, setMovie] = useState(null);
const [members, setMembers] = useState([]);
const [messages, setMessages] = useState([]);
const [playback, setPlayback] = useState({
    currentTime: 0,
    isPlaying: false
});

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [message, setMessage] = useState("");
const [videoReady, setVideoReady] = useState(false);
const [isHost, setIsHost] = useState(false);

const videoRef = useRef(null);

useEffect(() => {
    const connectToRoom = async () => {
        try {
            const data = await getRoom(roomCode);

            setRoom(data);
            setMovie(data.movie);

            socket.auth = {
                token: localStorage.getItem("token")
            };

            socket.connect();

            socket.emit("join-room", roomCode);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    connectToRoom();

    const handleRoomState = (data) => {
        console.log("SOCKET ROOM STATE:", data);

        setRoom(data.room);
        setMovie(data.movie);
        setMembers(data.members);
        setMessages(data.messages);
        setPlayback(data.playback);
        setIsHost(data.isHost);

        setLoading(false);
    };

    const handleMemberJoined = (member) => {
        setMembers((prev) => {
            if (prev.some((m) => m.id === member.id)) {
                return prev;
            }

            return [...prev, member];
        });
    };

    const handleMemberLeft = (member) => {
        setMembers((prev) =>
            prev.filter((m) => m.id !== member.id)
        );
    };

    const handleNewMessage = (newMessage) => {
        setMessages((prev) => [
            ...prev,
            newMessage
        ]);
    };

    const handlePlaybackUpdated = (data) => {
        const video = videoRef.current;

        setPlayback({
            currentTime: data.currentTime,
            isPlaying: data.isPlaying
        });

        if (!video || isHost) {
            return;
        }

        video.currentTime = data.currentTime;

        if (data.isPlaying) {
            if (!videoReady) {
                return;
            }

            video.play().catch((err) => {
                console.error(
                    "Unable to play video:",
                    err
                );
            });
        } else {
            video.pause();
        }
    };

    const handlePlaybackSeeked = (data) => {
        const video = videoRef.current;

        setPlayback((prev) => ({
            ...prev,
            currentTime: data.currentTime
        }));

        if (!video || isHost) {
            return;
        }

        video.currentTime = data.currentTime;
    };

    const handleSocketError = (data) => {
        console.error("SOCKET ERROR:", data);
        setError(data.message);
    };

    socket.on(
        "room-state",
        handleRoomState
    );

    socket.on(
        "member-joined",
        handleMemberJoined
    );

    socket.on(
        "member-left",
        handleMemberLeft
    );

    socket.on(
        "new-message",
        handleNewMessage
    );

    socket.on(
        "playback-updated",
        handlePlaybackUpdated
    );

    socket.on(
        "playback-seeked",
        handlePlaybackSeeked
    );

    socket.on(
        "error-message",
        handleSocketError
    );

    return () => {
        socket.off(
            "room-state",
            handleRoomState
        );

        socket.off(
            "member-joined",
            handleMemberJoined
        );

        socket.off(
            "member-left",
            handleMemberLeft
        );

        socket.off(
            "new-message",
            handleNewMessage
        );

        socket.off(
            "playback-updated",
            handlePlaybackUpdated
        );

        socket.off(
            "playback-seeked",
            handlePlaybackSeeked
        );

        socket.off(
            "error-message",
            handleSocketError
        );

        socket.disconnect();
    };
}, [roomCode, isHost, videoReady]);

const handleJoinPlayback = async () => {
    const video = videoRef.current;

    if (!video) {
        return;
    }

    setVideoReady(true);

    video.currentTime = playback.currentTime;

    if (playback.isPlaying) {
        try {
            await video.play();
        } catch (err) {
            console.error(
                "Unable to start playback:",
                err
            );
        }
    }
};

const handleVideoPlay = () => {
    if (!isHost || !videoRef.current) {
        return;
    }

    const currentTime =
        videoRef.current.currentTime;

    setPlayback({
        currentTime,
        isPlaying: true
    });

    socket.emit("play-pause", {
        isPlaying: true,
        currentTime
    });
};

const handleVideoPause = () => {
    if (!isHost || !videoRef.current) {
        return;
    }

    const currentTime =
        videoRef.current.currentTime;

    setPlayback({
        currentTime,
        isPlaying: false
    });

    socket.emit("play-pause", {
        isPlaying: false,
        currentTime
    });
};

const handleVideoSeek = () => {
    if (!isHost || !videoRef.current) {
        return;
    }

    const currentTime =
        videoRef.current.currentTime;

    setPlayback((prev) => ({
        ...prev,
        currentTime
    }));

    socket.emit(
        "seek",
        currentTime
    );
};

const handleLeaveRoom = async () => {
    try {
        await leaveRoom();
        socket.disconnect();
        navigate("/dashboard");
    } catch (err) {
        setError(err.message);
    }
};

const handleSendMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) {
        return;
    }

    socket.emit(
        "send-message",
        message
    );

    setMessage("");
};

const handleHostChanged = (host) => {
    console.log("NEW HOST:", host);

    setRoom((prev) => ({
        ...prev,
        currentHost: {
            _id: host.id,
            username: host.username
        }
    }));

    setIsHost(
        host.id === localStorage.getItem("userId")
    );
};

if (loading) {
    return (
        <div className="page">
            <h2>Loading room...</h2>
        </div>
    );
}

if (error) {
    return (
        <div className="page">
            <p className="error">
                {error}
            </p>
        </div>
    );
}

if (!room || !movie) {
    return null;
}

return (
    <div className="watch-room">
        <header className="room-header">
            <div>
                <h1>CineSync</h1>

                <p>
                    {room.roomName}
                    {" • "}
                    Room Code:{" "}
                    <strong>
                        {room.roomCode}
                    </strong>
                </p>
            </div>

            <button
                className="leave-room-button"
                onClick={handleLeaveRoom}
            >
                Leave Room
            </button>
        </header>

        <main className="watch-room-content">
            <section className="video-section">
                {!isHost && !videoReady && (
                    <div className="playback-overlay">
                        <p>
                            Click below to join synchronized playback.
                        </p>

                        <button
                            onClick={handleJoinPlayback}
                        >
                            Join Playback
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    controls={isHost}
                    width="100%"
                    poster={movie.thumbnail}
                    onPlay={
                        isHost
                            ? handleVideoPlay
                            : undefined
                    }
                    onPause={
                        isHost
                            ? handleVideoPause
                            : undefined
                    }
                    onSeeked={
                        isHost
                            ? handleVideoSeek
                            : undefined
                    }
                >
                    <source
                        src={movie.videoUrl}
                        type="video/mp4"
                    />

                    Your browser does not support video playback.
                </video>

                <div className="movie-details">
                    <h2>{movie.title}</h2>

                    <p>
                        {movie.description}
                    </p>
                </div>
            </section>

            <aside className="room-sidebar">
                <div className="members-section">
                    <h2>Members</h2>

                    {members.map((member) => (
                        <div
                            className="member"
                            key={member.id}
                        >
                            <span className="member-dot">
                                ●
                            </span>

                            <span>
                                {member.username}
                            </span>

                            {room.currentHost?._id ===
                                member.id && (
                                <span className="host-label">
                                    Host
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="chat-section">
                    <h2>Chat</h2>

                    <div className="chat-messages">
                        {messages.length === 0 ? (
                            <p className="empty-chat">
                                No messages yet.
                            </p>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    className="chat-message"
                                    key={msg.id}
                                >
                                    <strong>
                                        {msg.username}
                                    </strong>

                                    <p>
                                        {msg.text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <form
                        className="chat-form"
                        onSubmit={handleSendMessage}
                    >
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                        />

                        <button type="submit">
                            Send
                        </button>
                    </form>
                </div>
            </aside>
        </main>
    </div>
);


}

export default WatchRoom;
