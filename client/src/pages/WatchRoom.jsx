import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoom, leaveRoom, kickMember } from "../api/roomApi";
import { submitRating } from "../api/ratingApi";
import EmojiPicker from "emoji-picker-react";
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
    isPlaying: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatMessagesRef = useRef(null);
  const videoRef = useRef(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState(false);

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        const data = await getRoom(roomCode);

        setRoom(data);
        setMovie(data.movie);

        socket.auth = {
          token: localStorage.getItem("token"),
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

      const currentUser = JSON.parse(localStorage.getItem("user"));

      if (
        currentUser &&
        data.room.currentHost &&
        data.room.currentHost._id === currentUser.id
      ) {
        setIsHost(true);
      } else {
        setIsHost(false);
      }

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
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    };

    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handlePlaybackUpdated = (data) => {
      const video = videoRef.current;

      setPlayback({
        currentTime: data.currentTime,
        isPlaying: data.isPlaying,
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
          console.error("Unable to play video:", err);
        });
      } else {
        video.pause();
      }
    };

    const handlePlaybackSeeked = (data) => {
      const video = videoRef.current;

      setPlayback((prev) => ({
        ...prev,
        currentTime: data.currentTime,
      }));

      if (!video || isHost) {
        return;
      }

      video.currentTime = data.currentTime;
    };

    const handleKickMember = async (userId) => {
      try {
        await kickMember(userId);

        setMembers((prev) => prev.filter((member) => member.id !== userId));
      } catch (err) {
        console.error("Unable to remove member:", err.message);
      }
    };

    const handleSocketError = (data) => {
      console.error("SOCKET ERROR:", data);
      setError(data.message);
    };

    const handleRoomEnded = () => {
      setRoom((prev) => (prev ? { ...prev, status: "ENDED" } : prev));

      setShowRatingModal(true);
    };

    socket.on("room-state", handleRoomState);

    socket.on("member-joined", handleMemberJoined);

    socket.on("member-left", handleMemberLeft);

    socket.on("new-message", handleNewMessage);

    socket.on("playback-updated", handlePlaybackUpdated);

    socket.on("playback-seeked", handlePlaybackSeeked);

    socket.on("error-message", handleSocketError);

    socket.on("host-changed", handleHostChanged);

    socket.on("room-ended", handleRoomEnded);
    return () => {
      socket.off("room-state", handleRoomState);

      socket.off("member-joined", handleMemberJoined);

      socket.off("member-left", handleMemberLeft);

      socket.off("new-message", handleNewMessage);

      socket.off("playback-updated", handlePlaybackUpdated);

      socket.off("playback-seeked", handlePlaybackSeeked);

      socket.off("error-message", handleSocketError);
      socket.off("host-changed", handleHostChanged);
      socket.off("room-ended", handleRoomEnded);
      socket.disconnect();
    };
  }, [roomCode, isHost, videoReady]);

  useEffect(() => {
    const chatMessages = chatMessagesRef.current;

    if (!chatMessages) {
      return;
    }

    chatMessages.scrollTo({
      top: chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
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
        console.error("Unable to start playback:", err);
      }
    }
  };

  const handleVideoPlay = () => {
    if (!isHost || !videoRef.current) {
      return;
    }

    const currentTime = videoRef.current.currentTime;

    setPlayback({
      currentTime,
      isPlaying: true,
    });

    socket.emit("play-pause", {
      isPlaying: true,
      currentTime,
    });
  };

  const handleVideoPause = () => {
    if (!isHost || !videoRef.current) {
      return;
    }

    const currentTime = videoRef.current.currentTime;

    setPlayback({
      currentTime,
      isPlaying: false,
    });

    socket.emit("play-pause", {
      isPlaying: false,
      currentTime,
    });
  };

  const handleVideoSeek = () => {
    if (!isHost || !videoRef.current) {
      return;
    }

    const currentTime = videoRef.current.currentTime;

    setPlayback((prev) => ({
      ...prev,
      currentTime,
    }));

    socket.emit("seek", currentTime);
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

    socket.emit("send-message", message);

    setMessage("");
  };
  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleHostChanged = (host) => {
    console.log("NEW HOST:", host);

    setRoom((prev) => ({
      ...prev,
      currentHost: {
        _id: host.id,
        username: host.username,
      },
    }));

    setIsHost(host.id === localStorage.getItem("userId"));
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0 || !room || !movie) {
      return;
    }

    try {
      setRatingLoading(true);
      setRatingError("");
      console.log("Rating payload:", {
        movieId: movie?._id,
        roomId: room?._id,
        rating: selectedRating
    });
      await submitRating(movie._id, room._id, selectedRating);

      setRatingSuccess(true);
    } catch (err) {
      setRatingError(err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  const handleVideoEnded = () => {
    if (isHost) {
      socket.emit("video-ended");
    }
  };

  if (loading) {
    return (
      <div className="watch-room">
        <div className="room-loading">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-room">
        <div className="room-error">{error}</div>
      </div>
    );
  }

  if (!room || !movie) {
    return null;
  }

  return (
    <div className="watch-room">
      {/* =========================
                HEADER
            ========================= */}

      <header className="room-header">
        <div className="room-header-left">
          <h1>
            Cine<span>Sync</span>
          </h1>

          <p>
            {room.roomName}
            {" • "}
            Room Code: <strong>{room.roomCode}</strong>
          </p>
        </div>

        <button className="leave-room-button" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </header>

      {/* =========================
                MAIN CONTENT
            ========================= */}

      <main className="watch-room-content">
        {/* =========================
                    VIDEO SECTION
                ========================= */}

        <section className="video-section">
          {!isHost && !videoReady && (
            <div className="playback-overlay">
              <p>Click below to join synchronized playback.</p>

              <button onClick={handleJoinPlayback}>Join Playback</button>
            </div>
          )}

          <video
            ref={videoRef}
            controls={isHost}
            width="100%"
            poster={movie.thumbnail}
            onPlay={isHost ? handleVideoPlay : undefined}
            onPause={isHost ? handleVideoPause : undefined}
            onSeeked={isHost ? handleVideoSeek : undefined}
            onEnded={isHost ? handleVideoEnded : undefined}
          >
            <source src={movie.videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>

          <div className="movie-details">
            <h2>{movie.title}</h2>

            <p>{movie.description}</p>
          </div>
        </section>

        {/* =========================
                    SIDEBAR
                ========================= */}

        <aside className="room-sidebar">
          {/* Tabs */}

          <div className="sidebar-tabs">
            <button
              className={activeTab === "members" ? "active" : ""}
              onClick={() => setActiveTab("members")}
            >
              Members
            </button>

            <button
              className={activeTab === "chat" ? "active" : ""}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>

            <div
              className={`tab-slider ${
                activeTab === "chat" ? "slide-right" : ""
              }`}
            />
          </div>

          {/* =========================
                        MEMBERS
                    ========================= */}

          {activeTab === "members" && (
            <div className="members-panel">
              <div className="members-heading">
                <h2>Active Members</h2>

                <span>{members.length}</span>
              </div>

              <div className="members-list">
                {members.map((member) => (
                  <div className="member" key={member.id}>
                    <span className="member-dot">●</span>

                    <span className="member-name">{member.username}</span>

                    {room.currentHost?._id === member.id && (
                      <span className="host-label">Host</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================
                        CHAT
                    ========================= */}

          {activeTab === "chat" && (
            <div className="chat-section">
              <div className="chat-messages" ref={chatMessagesRef}>
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">💬</div>

                    <p>No messages yet.</p>

                    <span>Start the conversation.</span>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div className="chat-message" key={msg.id}>
                      <div className="chat-message-header">
                        <strong>{msg.username}</strong>
                      </div>

                      <div className="chat-message-body">
                        <p>{msg.text}</p>

                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Fixed chat input */}

              <div className="chat-input-wrapper">
                {showEmojiPicker && (
                  <div className="emoji-picker-container">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      height={350}
                      width={300}
                    />
                  </div>
                )}

                <form className="chat-form" onSubmit={handleSendMessage}>
                  <button
                    type="button"
                    className="emoji-button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    aria-label="Open emoji picker"
                  >
                    😊
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={() => {
                      // Keep picker closed when typing
                    }}
                  />

                  <button
                    type="submit"
                    className="send-button"
                    aria-label="Send message"
                  >
                    ➤
                  </button>
                </form>
              </div>
            </div>
          )}
        </aside>
      </main>

      {showRatingModal && (
        <div className="rating-overlay">
          <div className="rating-modal">
            {ratingSuccess ? (
              <>
                <h2>Thank you for rating!</h2>
                <p>Your rating has been saved.</p>

                <button
                  className="submit-rating-button"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </>
            ) : (
              <>
                <h2>How was the movie?</h2>
                <p>Rate {movie.title}</p>

                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={selectedRating >= star ? "selected" : ""}
                      onClick={() => setSelectedRating(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {ratingError && <p className="rating-error">{ratingError}</p>}

                <button
                  className="submit-rating-button"
                  onClick={handleSubmitRating}
                  disabled={selectedRating === 0 || ratingLoading}
                >
                  {ratingLoading ? "Submitting..." : "Submit Rating"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchRoom;
