const { getSeatsByShowtime } = require("../models/seat.model");

async function getSeatsForShowtime(req, res) {
  try {
    const showtimeId = req.params.id;

    const data = await getSeatsByShowtime(showtimeId);
    if (!data) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Get seats error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getSeatsForShowtime,
};
