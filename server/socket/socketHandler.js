const handleRoomSocket = require("./roomSocket");
const handleChatSocket = require("./chatSocket");
const handlePlaybackSocket = require("./playbackSocket");

module.exports = (io) => {

    io.on("connection", (socket) => {

        console.log(
            `User connected: ${socket.user.username}`
        );

        handleRoomSocket(io, socket);
        handleChatSocket(io, socket);
        handlePlaybackSocket(io, socket);

    });

};