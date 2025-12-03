const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

// GET /api/movies
router.get("/", movieController.listMovies);

//api/movies/:id xem chi tiết phim
router.get("/:id", movieController.getMovie);

// ADMIN ROUTES CRUD
router.post("/", requireAuth, requireAdmin, movieController.createMovie);
router.put("/:id", requireAuth, requireAdmin, movieController.updateMovie);
router.delete("/:id", requireAuth, requireAdmin, movieController.deleteMovie);

module.exports = router;
