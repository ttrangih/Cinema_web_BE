const movieModel = require("./movie.model");

async function adminListMovies(req, res) {
  try {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalItems = await movieModel.getTotalMovies(q);
    const totalPages = Math.ceil(totalItems / limit);

    const items = await movieModel.adminSearchMovies({ q, limit, offset });

    res.json({
      items,
      pagination: { currentPage: page, totalPages, totalItems },
    });

  } catch (err) {
    console.error("Admin search movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { adminListMovies };
