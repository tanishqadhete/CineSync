const jwt = require("jsonwebtoken");
const User = require("../models/User");

const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication token required."));
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new Error("User not found."));
        }
        socket.user = user;
        next();
    }
    catch (err) {
        next(new Error("Invalid or expired token."));
    }
};

module.exports = socketAuthMiddleware;