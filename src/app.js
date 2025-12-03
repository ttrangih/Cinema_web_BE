const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { getPool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// test server
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Cinema API is running" });
});

// test database
app.get("/api/db-test", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT GETDATE() AS Now");
    res.json({ ok: true, now: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const authRoutes = require("./routes/auth.route");
app.use("/api/auth", authRoutes);

const movieRoutes = require("./routes/movie.route");
app.use("/api/movies", movieRoutes);

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const YAML = require('yaml');
const path = require('path');

// Swagger
const swaggerPath = path.join(__dirname, '../swagger.yaml');

// Đọc YAML
const file = fs.readFileSync(swaggerPath, 'utf8');
const swaggerDocument = YAML.parse(file);

// Mount Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
