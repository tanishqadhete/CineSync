const API_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed.");
    }

    return data;
};

export const registerUser = async (
    username,
    email,
    password
) => {

    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
    }

    return data;
};

export const getMovies = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        "http://localhost:5000/api/movies",
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
            data.message || "Failed to fetch movies."
        );
    }

    return data;
};

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