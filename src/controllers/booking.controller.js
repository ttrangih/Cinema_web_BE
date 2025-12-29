const { createBooking } = require("../models/booking.model");

async function createBookingController(req, res) {
  try {
    const userId = req.user.id; // lấy từ JWT (requireAuth)
    const { showtimeId, seatIds } = req.body;

    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res
        .status(400)
        .json({ message: "showtimeId và seatIds là bắt buộc" });
    }

    const result = await createBooking(userId, showtimeId, seatIds);

    if (!result.success && result.reason === "SEAT_TAKEN") {
      return res.status(409).json({
        message: "Một số ghế đã được đặt",
        conflictSeatIds: result.conflictSeatIds,
      });
    }

    res.status(201).json({
      message: "Booking created",
      bookingId: result.bookingId,
      showtimeId: result.showtimeId,
      seatIds: result.seatIds,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createBooking: createBookingController,
};
