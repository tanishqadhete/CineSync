import { useNavigate } from "react-router-dom";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <div className="dashboard">

            <h1>Welcome to CineSync</h1>

            <p>
                Hello, {user?.username}
            </p>

            <div className="dashboard-actions">

                <button
                    onClick={() => navigate("/movies")}
                >
                    Browse Movies
                </button>

                <button
                    onClick={() => navigate("/create-room")}
                >
                    Create Room
                </button>

                <button
                    onClick={() => navigate("/join-room")}
                >
                    Join Room
                </button>

            </div>

            <button
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>

        </div>
    );
}

export default Dashboard;