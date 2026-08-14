// movieSocket.js

module.exports = (io, socket) => {

    // Admin adds a movie
    socket.on("movie-added", (movie) => {

        io.emit("movie-added", movie);

    });

    // Admin removes a movie
    socket.on("movie-removed", (movieId) => {

        io.emit("movie-removed", movieId);

    });

};