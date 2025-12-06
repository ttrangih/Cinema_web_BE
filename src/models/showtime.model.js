// src/models/showtime.model.js
const pool = require("../config/db");

/**
 * Lấy danh sách suất chiếu theo movie + date
 */
async function getShowtimesByMovieAndDate(movieId, date) {
  const targetDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const query = `
    SELECT
      s.id          AS "showtimeId",
      s.starttime   AS "startTime",
      s.price       AS "price",

      c.id          AS "cinemaId",
      c.name        AS "cinemaName",
      c.address     AS "cinemaAddress",

      r.id          AS "roomId",
      r.name        AS "roomName"
    FROM showtimes s
    JOIN rooms r   ON s.roomid = r.id
    JOIN cinemas c ON r.cinemaid = c.id
    WHERE s.movieid = $1
      AND DATE(s.starttime) = $2
    ORDER BY c.id, r.id, s.starttime;
  `;

  const result = await pool.query(query, [movieId, targetDate]);
  return { rows: result.rows, date: targetDate };
}

module.exports = {
  getShowtimesByMovieAndDate,
};
