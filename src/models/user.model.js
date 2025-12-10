const { query } = require("../config/db");


//find user by email
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
