const { getShowtimesByMovieAndDate } = require("../models/showtime.model");
const movieModel = require("../models/movie.model");

const dateKeyVN = (input = new Date()) => {
  const d = input instanceof Date ? input : new Date(input);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // YYYY-MM-DD
};

/**
 * GET /api/movies/:id/showtimes?date=YYYY-MM-DD
 */
async function getShowtimesForMovie(req, res) {
  try {
    const movieId = Number(req.params.id);
    const { date } = req.query;

    const targetDate = date || dateKeyVN();
    const rows = await getShowtimesByMovieAndDate(movieId, targetDate);

    if (!rows.length) {
      return res.json({
        movieId,
        date: targetDate,
        cinemas: [],
      });
    }

    // group theo cinema → room → showtimes
    const cinemasMap = new Map();

    for (const row of rows) {
      if (!cinemasMap.has(row.cinemaId)) {
        cinemasMap.set(row.cinemaId, {
          cinemaId: row.cinemaId,
          cinemaName: row.cinemaName,
          cinemaAddress: row.cinemaAddress,
          rooms: new Map(),
        });
      }

      const cinema = cinemasMap.get(row.cinemaId);

      if (!cinema.rooms.has(row.roomId)) {
        cinema.rooms.set(row.roomId, {
          roomId: row.roomId,
          roomName: row.roomName,
          showtimes: [],
        });
      }

      cinema.rooms.get(row.roomId).showtimes.push({
        showtimeId: row.showtimeId,
        startTime: row.startTime,
        price: row.price,
      });
    }

    const cinemas = Array.from(cinemasMap.values()).map((c) => ({
      ...c,
      rooms: Array.from(c.rooms.values()),
    }));

    res.json({
      movieId,
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