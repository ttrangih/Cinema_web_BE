const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movie.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const showtimeController = require("../controllers/showtime.controller");


// phim đang chiếu và phim sắp chiếu
router.get("/now", movieController.listNowShowing);
router.get("/soon", movieController.listComingSoon);


//api/movies
router.get("/", movieController.listMovies);

//api/movies/:id xem chi tiết phim
router.get("/:id", movieController.getMovie);

//api/movies/:id/showtimes?date=YYYY-MM-DD
router.get("/:id/showtimes", showtimeController.getShowtimesForMovie);

// ADMIN ROUTES CRUD
router.post("/", requireAuth, requireAdmin, movieController.createMovie);
router.put("/:id", requireAuth, requireAdmin, movieController.updateMovie);
router.delete("/:id", requireAuth, requireAdmin, movieController.deleteMovie);

module.exports = router;
