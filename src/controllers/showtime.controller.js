// src/controllers/showtime.controller.js
const { getShowtimesByMovieAndDate } = require("../models/showtime.model");
const movieModel = require("../models/movie.model");

/**
 * GET /api/movies/:id/showtimes?date=YYYY-MM-DD
 */
async function getShowtimesForMovie(req, res) {
  try {
    const movieId = req.params.id;
    const { date } = req.query;

    // Kiểm tra phim có tồn tại không (cho đẹp)
    const movie = await movieModel.getMovieById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const { rows, date: targetDate } = await getShowtimesByMovieAndDate(
      movieId,
      date
    );

    // Không có suất chiếu
    if (!rows.length) {
      return res.json({
        movieId: Number(movieId),
        date: targetDate,
        cinemas: [],
      });
    }

    // Group theo cinema → room → showtimes
    const cinemaMap = {};

    for (const row of rows) {
      const {
        cinemaId,
        cinemaName,
        cinemaAddress,
        roomId,
        roomName,
        showtimeId,
        startTime,
        price,
      } = row;

      if (!cinemaMap[cinemaId]) {
        cinemaMap[cinemaId] = {
          cinemaId,
          cinemaName,
          address: cinemaAddress,
          rooms: {},
        };
      }

      const cinema = cinemaMap[cinemaId];

      if (!cinema.rooms[roomId]) {
        cinema.rooms[roomId] = {
          roomId,
          roomName,
          showtimes: [],
        };
      }

      cinema.rooms[roomId].showtimes.push({
        showtimeId,
        startTime,
        price,
      });
    }

    // Convert room map → array
    const cinemas = Object.values(cinemaMap).map((c) => ({
      cinemaId: c.cinemaId,
      cinemaName: c.cinemaName,
      address: c.address,
      rooms: Object.values(c.rooms),
    }));

    res.json({
      movieId: Number(movieId),
      date: targetDate,
      cinemas,
    });
  } catch (err) {
    console.error("Get showtimes error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getShowtimesForMovie,
};