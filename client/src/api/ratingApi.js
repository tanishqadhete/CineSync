const API_URL = "https://cinesync-backend-mnq9.onrender.com/api";

// =========================
// SUBMIT MOVIE RATING
// =========================

export const submitRating = async (movieId, stars) => {

const token = localStorage.getItem("token");

const response = await fetch(
    `${API_URL}/ratings`,
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            movieId,
            stars
        })
    }
);

const data = await response.json();

if (!response.ok) {
    throw new Error(
        data.message ||
        "Failed to submit rating."
    );
}

return data;

};
