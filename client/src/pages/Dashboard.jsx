import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const requireLogin = (path) => {

        if (!token) {
            navigate("/");
            return;
        }

        navigate(path);
    };

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <div className="dashboard">

            <div className="dashboard-glow"></div>

            <header className="dashboard-header">

                <div className="brand">
                    Cine<span>Sync</span>
                </div>

                {token ? (

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                ) : (

                    <button
                        className="logout-button"
                        onClick={() => navigate("/")}
                    >
                        Login
                    </button>

                )}

            </header>

            <main className="dashboard-content">

                <section className="hero-section">

                    <p className="hero-label">
                        YOUR PRIVATE WATCH PARTY
                    </p>

                    <h1>
                        Watch together.
                        <br />
                        <span>Stay synchronized.</span>
                    </h1>

                    <p className="hero-description">
                        Create a room, invite your friends and enjoy
                        movies together in perfect sync — with live chat
                        right beside you.
                    </p>

                    {user && (
                        <p className="welcome-text">
                            Welcome back,{" "}
                            <strong>{user.username}</strong>
                        </p>
                    )}

                </section>

                <section className="room-actions">

                    <button
                        className="room-action-card create-card"
                        onClick={() =>
                            requireLogin("/create-room")
                        }
                    >

                        <div className="action-icon">
                            +
                        </div>

                        <div className="action-content">

                            <span className="action-label">
                                START A WATCH PARTY
                            </span>

                            <h2>
                                Create a Room
                            </h2>

                            <p>
                                Choose a movie and invite your friends
                                to watch together.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </button>

                    <button
                        className="room-action-card join-card"
                        onClick={() =>
                            requireLogin("/join-room")
                        }
                    >

                        <div className="action-icon">
                            ↗
                        </div>

                        <div className="action-content">

                            <span className="action-label">
                                JOIN YOUR FRIENDS
                            </span>

                            <h2>
                                Join a Room
                            </h2>

                            <p>
                                Enter a room code and jump straight
                                into the watch party.
                            </p>

                        </div>

                        <span className="action-arrow">
                            →
                        </span>

                    </button>

                </section>

                <section className="browse-section">

                    <button
                        className="browse-button"
                        onClick={() =>
                            requireLogin("/movies")
                        }
                    >
                        <span>
                            Browse Movies
                        </span>

                        <span>
                            →
                        </span>

                    </button>

                </section>

                <section className="dashboard-features">

                    <div className="feature">

                        <div className="feature-icon">
                            ▶
                        </div>

                        <div>

                            <h3>
                                Synchronized Playback
                            </h3>

                            <p>
                                Everyone watches the same moment,
                                every time.
                            </p>

                        </div>

                    </div>

                    <div className="feature">

                        <div className="feature-icon">
                            💬
                        </div>

                        <div>

                            <h3>
                                Live Chat
                            </h3>

                            <p>
                                Talk, react and enjoy the movie
                                together.
                            </p>

                        </div>

                    </div>

                    <div className="feature">

                        <div className="feature-icon">
                            👥
                        </div>

                        <div>

                            <h3>
                                Private Rooms
                            </h3>

                            <p>
                                Create your own space for your
                                watch party.
                            </p>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;
