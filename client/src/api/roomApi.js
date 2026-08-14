const API_URL = "https://cinesync-backend-mnq9.onrender.com/api";

export const createRoom = async (
    roomName,
    movieId,
    maxMembers
) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/rooms/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                roomName,
                movieId,
                maxMembers
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create room."
        );
    }

    return data;
};

export const joinRoom = async (roomCode) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/rooms/join`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                roomCode
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to join room."
        );
    }

    return data;
};

export const getRoom = async (roomCode) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/rooms/${roomCode}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch room."
        );
    }

    return data;
};

export const leaveRoom = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/rooms/leave`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to leave room."
        );
    }

    return data;
};

export const kickMember = async (userId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/rooms/kick`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to remove member."
        );
    }

    return data;
};