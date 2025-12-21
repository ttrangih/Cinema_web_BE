const movieModel = require("../models/movie.model");

/**
 * GET /api/admin/movies
 * Admin xem + tìm kiếm phim
 * ?q=...&page=1
 */
async function listMovies(req, res) {
  try {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const totalItems = await movieModel.getTotalMovies(q);
    const totalPages = Math.ceil(totalItems / limit);

    const items = await movieModel.adminSearchMovies({
      q,
      limit,
      offset,
    });

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
    console.error("Admin list movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/admin/movies/:id
 * Admin lấy chi tiết 1 phim
 */
async function getMovieById(req, res) {
  try {
    const movieId = req.params.id;
    const movie = await movieModel.getMovieById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.json(movie);
  } catch (err) {
    console.error("Admin get movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


/**
 * POST /api/admin/movies
 * Admin thêm phim mới
 */
async function createMovie(req, res) {
  try {
    const {
      title,
      description,
      durationMinutes,
      releaseDate,
      ageRating,
      posterUrl,
      trailerUrl,
    } = req.body;

    if (!title || !durationMinutes) {
      return res.status(400).json({
        message: "Title and durationMinutes are required",
      });
    }

    const movie = await movieModel.createMovie({
      title,
      description,
      durationMinutes,
      releaseDate,
      ageRating,
      posterUrl,
      trailerUrl,
    });

    return res.status(201).json(movie);

  } catch (err) {
    console.error("Admin create movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * PUT /api/admin/movies/:id
 * Admin cập nhật phim
 */
async function updateMovie(req, res) {
  try {
    const movieId = req.params.id;
    const exists = await movieModel.getMovieById(movieId);

    if (!exists) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movie = await movieModel.updateMovie(movieId, req.body);

    res.json(movie);

  } catch (err) {
    console.error("Admin update movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * DELETE /api/admin/movies/:id
 * Admin xoá phim
 */
async function deleteMovie(req, res) {
  try {
    const movieId = req.params.id;
    const exists = await movieModel.getMovieById(movieId);

    if (!exists) {
      return res.status(404).json({ message: "Movie not found" });
    }

    await movieModel.deleteMovie(movieId);

    res.json({ message: "Movie deleted" });

  } catch (err) {
    console.error("Admin delete movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getMovieById,
};
