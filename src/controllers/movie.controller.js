const movieModel = require("../models/movie.model");

// GET /api/movies
async function listMovies(req, res) {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; //limit số phim trong 1 trang
    const offset = (page - 1) * limit; //tính để phân số phim limit trong 1 trang

    const totalItems = await movieModel.getTotalMovies(q); //tổng số phim
    const totalPages = Math.ceil(totalItems / limit);//tổng số trang

    //list movie
    const items = await movieModel.listMovies({
      q,
      limit,
      offset,
    });

    return res.json({
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    });

  } catch (err) {
    console.error("List movies error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


// GET /api/movies/:id
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

// POST /api/movies (admin)
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

// PUT /api/movies/:id (admin)
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

// DELETE /api/movies/:id (admin)
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

module.exports = {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
};
