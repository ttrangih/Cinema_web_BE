const express = require("express");
const router = express.Router();
const { getSeatsForShowtime } = require("../controllers/seat.controller");

// Lấy danh sách ghế + ghế đã đặt cho 1 suất chiếu showtimes/:id/seats
router.get("/:id/seats", getSeatsForShowtime);

module.exports = router;
