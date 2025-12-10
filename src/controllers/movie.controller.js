const movieModel = require("../models/movie.model");


// GET /api/movies
async function listMovies(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const totalItems = await movieModel.getTotalMovies();
  const totalPages = Math.ceil(totalItems / limit);

  const items = await movieModel.listMovies({ limit, offset });

  return res.json({
    items,
    pagination: { currentPage: page, totalPages, totalItems },
  });
}



// GET /api/movies/:id lấy chi tiết phim theo id
async function getMovie(req, res) {
  try {
    const movie = await movieModel.getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    console.error("Get movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// POST /api/movies  (admin)
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

    // validate đơn giản: bắt buộc phải có title và durationMinutes
    if (!title || !durationMinutes) {
      return res
        .status(400)
        .json({ message: "Title and durationMinutes are required" });
    }

    const newMovie = await movieModel.createMovie({
      title,
      description,
      durationMinutes,
      releaseDate,
      ageRating,
      posterUrl,
      trailerUrl,
    });

    res.status(201).json(newMovie);
  } catch (err) {
    console.error("Create movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// PUT /api/movies/:id  (admin)
async function updateMovie(req, res) {
  try {
    const movie = await movieModel.updateMovie(req.params.id, req.body);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (err) {
    console.error("Update movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/movies/:id  xoá theo id (admin)
async function deleteMovie(req, res) {
  try {
    const movie = await movieModel.getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    await movieModel.deleteMovie(req.params.id);
    res.json({ message: "Movie deleted" });
  } catch (err) {
    console.error("Delete movie error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/movies/now (dựa vào bảng showtimes: có suất chiếu từ hiện tại trở đi)
async function listNowShowing(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    //model lấy phim đang chiếu
    const items = await movieModel.getNowShowingMovies({
      limit,
      offset,
    });

    return res.json({
      items,
      pagination: {
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("List now showing movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


// GET /api/movies/soon list phim sắp chiếu (releasedate > ngày hiện tại)
async function listComingSoon(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // gọi model lấy phim sắp chiếu
    const items = await movieModel.getComingSoonMovies({
      limit,
      offset,
    });

    return res.json({
      items,
      pagination: {
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("List coming soon movies error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  listNowShowing,
  listComingSoon,
};
