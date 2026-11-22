import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Movies from "./pages/Movies";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import WatchRoom from "./pages/WatchRoom";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/movies.css";
import "./styles/room.css";
import "./styles/admin.css";
import "./styles/watchroom.css";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route
                    path="/movies"
                    element={<Movies />}
                />
                <Route
                    path="/create-room"
                    element={<CreateRoom />}
                />
                <Route
                    path="/join-room"
                    element={<JoinRoom />}
                />
                <Route
                    path="/room/:roomCode"
                    element={<WatchRoom />}
                />
                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;