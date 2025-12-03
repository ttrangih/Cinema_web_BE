// src/models/movie.model.js
const { query } = require("../config/db");

// Lấy danh sách phim có phân trang + search
async function listMovies({ q, limit, offset }) {
  const params = [];
  let sql = `SELECT * FROM movies`;

  if (q) {
    params.push(`%${q}%`);
    sql += ` WHERE title ILIKE $${params.length}`;
  }

  sql += ` ORDER BY id DESC`;

  params.push(limit);
  sql += ` LIMIT $${params.length}`;

  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const result = await query(sql, params);
  return result.rows;
}

// (Optional) Lấy tất cả phim không phân trang
async function getAllMovies() {
  const result = await query(`SELECT * FROM movies ORDER BY id DESC`);
  return result.rows;
}

// Lấy phim theo Id
async function getMovieById(id) {
  const result = await query(`SELECT * FROM movies WHERE id = $1`, [id]);
  return result.rows[0]; // không có thì = undefined
}

// Xem tổng số phim (dùng cho pagination)
async function getTotalMovies(q) {
  if (q) {
    const result = await query(
      `SELECT COUNT(*) FROM movies WHERE title ILIKE $1`,
      [`%${q}%`]
    );
    return parseInt(result.rows[0].count);
  }

  const result = await query(`SELECT COUNT(*) FROM movies`);
  return parseInt(result.rows[0].count);
}

// Tạo phim mới
async function createMovie(data) {
  const {
    title,
    description,
    durationMinutes,
    releaseDate,
    ageRating,
    posterUrl,
    trailerUrl,
  } = data;

  const result = await query(
    `
    INSERT INTO movies 
      (title, description, "durationminutes", "releasedate", "agerating", "posterurl", "trailerurl")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,
    [
      title,
      description ?? null,
      durationMinutes,
      releaseDate ?? null,
      ageRating ?? null,
      posterUrl ?? null,
      trailerUrl ?? null,
    ]
  );

  return result.rows[0];
}

// Cập nhật phim
async function updateMovie(id, data) {
  const {
    title,
    description,
    durationMinutes,
    releaseDate,
    ageRating,
    posterUrl,
    trailerUrl,
  } = data;

  const result = await query(
    `
    UPDATE movies
    SET 
      title = $1,
      description = $2,
      "durationminutes" = $3,
      "releasedate" = $4,
      "agerating" = $5,
      "posterurl" = $6,
      "trailerurl" = $7
    WHERE id = $8
    RETURNING *;
  `,
    [
      title,
      description ?? null,
      durationMinutes,
      releaseDate ?? null,
      ageRating ?? null,
      posterUrl ?? null,
      trailerUrl ?? null,
      id,
    ]
  );

  return result.rows[0]; // nếu không có row → undefined → controller sẽ trả 404
}

// Xoá phim
async function deleteMovie(id) {
  await query(`DELETE FROM movies WHERE id = $1`, [id]);
}

module.exports = {
  listMovies,
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getTotalMovies,
};
