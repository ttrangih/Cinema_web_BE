const pool = require("../config/db");

/**
 * Lấy suất chiếu theo phim trong 1 tuần (từ date → date + 6 ngày)
 */
async function getShowtimesByMovieAndDate(movieId, date) {
  const startDate = date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
  const endDateQuery = `
      SELECT ($1::date + INTERVAL '6 days')::date AS "endDate"
  `;
  const endDateResult = await pool.query(endDateQuery, [startDate]);
  const endDate = endDateResult.rows[0].endDate;

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
      AND DATE(s.starttime) BETWEEN $2 AND $3   -- 🔥 trả cả tuần
    ORDER BY c.id, r.id, s.starttime;
  `;

  const result = await pool.query(query, [movieId, startDate, endDate]);
  return {
    rows: result.rows,
    weekStart: startDate,
    weekEnd: endDate
  };
}

module.exports = {
  getShowtimesByMovieAndDate,
};
