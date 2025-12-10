const pool = require("../config/db");

/*Public: Lấy danh sách suất chiếu theo movie + date*/
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

/*admin đếm tổng số showtime theo filter*/
async function adminCountShowtimes({ movieId, cinemaId, date }) {
  const params = [];
  let where = "WHERE 1=1";

  if (movieId) {
    params.push(movieId);
    where += ` AND s.movieid = $${params.length}`;
  }

  if (cinemaId) {
    params.push(cinemaId);
    where += ` AND c.id = $${params.length}`;
  }

  if (date) {
    params.push(date);
    where += ` AND DATE(s.starttime) = $${params.length}`;
  }

  const sql = `
    SELECT COUNT(*)::int AS total
    FROM showtimes s
    JOIN rooms r   ON s.roomid = r.id
    JOIN cinemas c ON r.cinemaid = c.id
    JOIN movies m  ON s.movieid = m.id
    ${where}
  `;

  const result = await pool.query(sql, params);
  return result.rows[0].total || 0;
}

/* Admin: list showtime + join movie/room/cinema*/
async function adminListShowtimes({ movieId, cinemaId, date, limit, offset }) {
  const params = [];
  let where = "WHERE 1=1";

  if (movieId) {
    params.push(movieId);
    where += ` AND s.movieid = $${params.length}`;
  }

  if (cinemaId) {
    params.push(cinemaId);
    where += ` AND c.id = $${params.length}`;
  }

  if (date) {
    params.push(date);
    where += ` AND DATE(s.starttime) = $${params.length}`;
  }

  const sql = `
    SELECT
      s.id          AS "id",
      s.starttime   AS "startTime",
      s.price       AS "price",
      m.id          AS "movieId",
      m.title       AS "movieTitle",
      r.id          AS "roomId",
      r.name        AS "roomName",
      c.id          AS "cinemaId",
      c.name        AS "cinemaName"
    FROM showtimes s
    JOIN rooms r   ON s.roomid = r.id
    JOIN cinemas c ON r.cinemaid = c.id
    JOIN movies m  ON s.movieid = m.id
    ${where}
    ORDER BY s.starttime
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2};
  `;

  params.push(limit);
  params.push(offset);

  const result = await pool.query(sql, params);
  return result.rows;
}

/*Admin: get 1 showtime*/
async function getShowtimeById(id) {
  const sql = `
    SELECT
      s.id          AS "id",
      s.starttime   AS "startTime",
      s.price       AS "price",
      s.movieid     AS "movieId",
      s.roomid      AS "roomId"
    FROM showtimes s
    WHERE s.id = $1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

/*Admin: create showtime*/
async function createShowtime({ movieId, roomId, startTime, price }) {
  const sql = `
    INSERT INTO showtimes (movieid, roomid, starttime, price)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id          AS "id",
      movieid     AS "movieId",
      roomid      AS "roomId",
      starttime   AS "startTime",
      price       AS "price"
  `;
  const result = await pool.query(sql, [movieId, roomId, startTime, price]);
  return result.rows[0];
}

/* Admin: update showtime*/
async function updateShowtime(id, { movieId, roomId, startTime, price }) {
  // build dynamic
  const fields = [];
  const params = [];
  let idx = 1;

  if (movieId !== undefined) {
    fields.push(`movieid = $${idx++}`);
    params.push(movieId);
  }
  if (roomId !== undefined) {
    fields.push(`roomid = $${idx++}`);
    params.push(roomId);
  }
  if (startTime !== undefined) {
    fields.push(`starttime = $${idx++}`);
    params.push(startTime);
  }
  if (price !== undefined) {
    fields.push(`price = $${idx++}`);
    params.push(price);
  }

  if (fields.length === 0) {
    // không có gì để update → trả lại bản hiện tại
    return getShowtimeById(id);
  }

  params.push(id);

  const sql = `
    UPDATE showtimes
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING
      id          AS "id",
      movieid     AS "movieId",
      roomid      AS "roomId",
      starttime   AS "startTime",
      price       AS "price"
  `;

  const result = await pool.query(sql, params);
  return result.rows[0];
}

/*Admin: delete showtime*/
async function deleteShowtime(id) {
  await pool.query("DELETE FROM showtimes WHERE id = $1", [id]);
}

module.exports = {
  getShowtimesByMovieAndDate,
  // admin
  adminCountShowtimes,
  adminListShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
