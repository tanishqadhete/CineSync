export const submitRating = async (movieId, roomId, rating) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ratings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            movieId,
            roomId,
            rating
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to submit rating."
        );
    }

    return data;
};
