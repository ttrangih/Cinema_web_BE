const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { getPool } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cinema-web-fe.onrender.com",
      "https://cinema-web-be-1.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());


//ROUTES 
const authRoutes = require("./routes/auth.route");
const movieRoutes = require("./routes/movie.route");
const showtimeRoutes = require("./routes/showtime.route");
const bookingRoutes = require("./routes/booking.route");
const adminMovieRoutes = require("./routes/admin.movie.route");
const adminShowtimeRoute = require("./routes/admin.showtime.route");

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/bookings", bookingRoutes);

// ADMIN routes
app.use("/api/admin/movies", adminMovieRoutes);
app.use("/api/admin/showtimes", adminShowtimeRoute);


// 3. TEST DB (PostgreSQL)
app.get("/api/db-test", async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

//swagger
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("yaml");
const path = require("path");

const swaggerPath = path.join(__dirname, "swagger.yaml");
const file = fs.readFileSync(swaggerPath, "utf8");
const swaggerDocument = YAML.parse(file);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
