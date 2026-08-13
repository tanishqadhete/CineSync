const API_URL = "http://localhost:5000/api";


// =========================
// GET ALL MOVIES
// =========================

export const getAdminMovies = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies/admin/all`,
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
            data.message ||
            "Failed to fetch movies."
        );
    }

    return data;
};


// =========================
// GET MOVIE STATISTICS
// =========================

export const getMovieStats = async () => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies/stats`,
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
            data.message ||
            "Failed to fetch movie statistics."
        );
    }

    return data;
};


// =========================
// ADD MOVIE
// =========================

export const addMovie = async (movieData) => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(movieData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to add movie."
        );
    }

    return data;
};


// =========================
// UPDATE MOVIE
// =========================

export const updateMovie = async (
    movieId,
    movieData
) => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies/${movieId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(movieData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to update movie."
        );
    }

    return data;
};


// =========================
// DELETE MOVIE
// =========================

export const deleteMovie = async (movieId) => {

    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/movies/${movieId}`,
        {
            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to delete movie."
        );
    }

    return data;
};
