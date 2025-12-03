const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },   
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { query };


async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}
pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));
module.exports = { query };

