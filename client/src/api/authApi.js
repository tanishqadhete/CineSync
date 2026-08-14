const API_URL = "https://cinesync-backend-mnq9.onrender.com/api";

export const loginUser = async (email, password) => {

    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Login failed."
        );
    }

    return data;
};


export const registerUser = async (
    username,
    email,
    password
) => {

    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Registration failed."
        );
    }

    return data;
};