const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

// Đặt vé (cần đăng nhập)
router.post("/", requireAuth, bookingController.createBooking);

module.exports = router;
