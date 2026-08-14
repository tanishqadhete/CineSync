import { io } from "socket.io-client";

const socket = io("https://cinesync-backend-mnq9.onrender.com", {
    autoConnect: false
});

export default socket;