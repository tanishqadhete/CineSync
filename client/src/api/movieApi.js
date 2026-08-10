const API_URL = "http://localhost:5000/api";

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