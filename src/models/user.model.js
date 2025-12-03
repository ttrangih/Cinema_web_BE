const { query } = require("../config/db");

// Find user by email
async function findUserByEmail(email) {
  const result = await query(
    `
    SELECT
      id          AS "Id",
      fullname    AS "FullName",
      email       AS "Email",
      passwordhash AS "PasswordHash",
      role        AS "Role",
      createdat   AS "CreatedAt"
    FROM users
    WHERE email = $1
  `,
    [email]
  );

  return result.rows[0]; // không có thì = undefined

}

// Create a new user
async function createUser({ fullName, email, passwordHash }) {
  const result = await query(
    `
    INSERT INTO users (fullname, email, passwordhash)
    VALUES ($1, $2, $3)
    RETURNING
      id          AS "Id",
      fullname    AS "FullName",
      email       AS "Email",
      passwordhash AS "PasswordHash",
      role        AS "Role",
      createdat   AS "CreatedAt"
  `,
    [fullName, email, passwordHash]
  );

  return result.rows[0];

}

module.exports = {
  findUserByEmail,
  createUser,
};
