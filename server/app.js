require("dotenv").config({
    path: process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development"
});
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const movieRoutes = require("./routes/movieRoutes");
const socketAuthMiddleware = require("./middleware/socketAuthMiddleware");
const socketHandler = require("./socket/socketHandler");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/ratings", ratingRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
app.set("io", io);
io.use(socketAuthMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        socketHandler(io);

        server.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });
    } catch (err) {
        console.error("Server startup failed:", err);
        process.exit(1);
    }
};

startServer();