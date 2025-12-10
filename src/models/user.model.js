// src/models/user.model.js
const { query } = require("../config/db");

// =========================
// Tìm user theo email
// =========================
async function findUserByEmail(email) {
  const result = await query(
    `
    SELECT
      id           AS "Id",
      fullname     AS "FullName",
      email        AS "Email",
      passwordhash AS "PasswordHash",
      role         AS "Role",
      createdat    AS "CreatedAt"
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}

// =========================
// Tạo user mới
// =========================
async function createUser({ fullName, email, passwordHash, role = "USER" }) {
  const result = await query(
    `
    INSERT INTO users (fullname, email, passwordhash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING 
      id           AS "Id",
      fullname     AS "FullName",
      email        AS "Email",
      role         AS "Role",
      createdat    AS "CreatedAt"
    `,
    [fullName, email, passwordHash, role]
  );

  return result.rows[0];
}

// =========================
// Tìm user theo ID (middleware đang dùng)
// =========================
async function findUserById(id) {
  const result = await query(
    `
    SELECT
      id           AS "Id",
      fullname     AS "FullName",
      email        AS "Email",
      passwordhash AS "PasswordHash",
      role         AS "Role",
      createdat    AS "CreatedAt"
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
