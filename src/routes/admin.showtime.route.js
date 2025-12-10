const router = require("express").Router();
const adminShowtimeController = require("../controllers/admin.showtime.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

// GET /api/admin/showtimes
router.get("/", requireAuth, requireAdmin, adminShowtimeController.listShowtimes);

// POST /api/admin/showtimes
router.post("/", requireAuth, requireAdmin, adminShowtimeController.createShowtime);

// PUT /api/admin/showtimes/:id
router.put("/:id", requireAuth, requireAdmin, adminShowtimeController.updateShowtime);

// DELETE /api/admin/showtimes/:id
router.delete("/:id", requireAuth, requireAdmin, adminShowtimeController.deleteShowtime);

module.exports = router;
