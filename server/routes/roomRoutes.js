const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom,
    getRoomMembers,
    kickMember,
    deleteRoom
} = require("../controllers/roomController");

router.post(
    "/create",
    authMiddleware,
    createRoom
);

router.post(
    "/join",
    authMiddleware,
    joinRoom
);

router.post(
    "/leave",
    authMiddleware,
    leaveRoom
);

router.get(
    "/:roomCode",
    authMiddleware,
    getRoom
);

router.get(
    "/:roomCode/members",
    authMiddleware,
    getRoomMembers
);

router.post(
    "/kick",
    authMiddleware,
    kickMember
);

router.delete(
    "/delete",
    authMiddleware,
    deleteRoom
);

module.exports = router;