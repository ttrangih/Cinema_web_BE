const showtimeModel = require("../models/showtime.model");


async function listShowtimes(req, res) {
  try {
    const movieId = req.query.movieId ? Number(req.query.movieId) : undefined;
    const cinemaId = req.query.cinemaId ? Number(req.query.cinemaId) : undefined;
    const date = req.query.date || undefined;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalItems = await showtimeModel.adminCountShowtimes({
      movieId,
      cinemaId,
      date,
    });

    const items = await showtimeModel.adminListShowtimes({
      movieId,
      cinemaId,
      date,
      limit,
      offset,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Admin list showtimes error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* body: { movieId, roomId, startTime, price }*/
async function createShowtime(req, res) {
  try {
    const { movieId, roomId, startTime, price } = req.body;

    if (!movieId || !roomId || !startTime) {
      return res.status(400).json({
        message: "movieId, roomId, startTime là bắt buộc",
      });
    }

    const created = await showtimeModel.createShowtime({
      movieId,
      roomId,
      startTime,
      price: price ?? 0,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("Admin create showtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


async function updateShowtime(req, res) {
  try {
    const id = req.params.id;
    const exists = await showtimeModel.getShowtimeById(id);
    if (!exists) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const { movieId, roomId, startTime, price } = req.body;

    const updated = await showtimeModel.updateShowtime(id, {
      movieId,
      roomId,
      startTime,
      price,
    });

    return res.json(updated);
  } catch (err) {
    console.error("Admin update showtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * DELETE /api/admin/showtimes/:id
 */
async function deleteShowtime(req, res) {
  try {
    const id = req.params.id;
    const exists = await showtimeModel.getShowtimeById(id);
    if (!exists) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    await showtimeModel.deleteShowtime(id);
    return res.json({ message: "Showtime deleted" });
  } catch (err) {
    console.error("Admin delete showtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listShowtimes,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
