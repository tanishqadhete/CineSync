const API_URL = "https://cinesync-backend-mnq9.onrender.com/api";

export const getMovies = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies`,
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