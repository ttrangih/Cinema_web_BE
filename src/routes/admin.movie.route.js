const router = require("express").Router();
const adminMovieController = require("../controllers/admin.movie.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

// GET /api/admin/movies?q=abc
router.get("/", requireAuth, requireAdmin, adminMovieController.listMovies);

// POST
router.post("/", requireAuth, requireAdmin, adminMovieController.createMovie);

// PUT 
router.put("/:id", requireAuth, requireAdmin, adminMovieController.updateMovie);

// DELETE
router.delete("/:id", requireAuth, requireAdmin, adminMovieController.deleteMovie);

module.exports = router;
