const Message = require("../models/Message");

module.exports = (io, socket) => {

    socket.on("send-message", async (text) => {

        try {

            if (!socket.roomId) {
                return socket.emit("error-message", {
                    message: "You are not connected to a room."
                });
            }

            if (!text || !text.trim()) {
                return;
            }

            const message = await Message.create({
                roomId: socket.roomId,
                sender: socket.user._id,
                text: text.trim()
            });

            const populatedMessage =
                await Message.findById(message._id)
                    .populate("sender", "username");

            io.to(socket.roomId).emit(
                "new-message",
                {
                    id: populatedMessage._id,
                    username: populatedMessage.sender.username,
                    text: populatedMessage.text,
                    createdAt: populatedMessage.createdAt
                }
            );

        }
        catch (err) {

            console.error(err);

            socket.emit("error-message", {
                message: "Unable to send message."
            });

        }

    });

};