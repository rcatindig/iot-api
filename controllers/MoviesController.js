const Movie = require('../models/Movie')

// FETCH ALL MOVIES
exports.getAllMovies = (req, res) => {

    Movie.getAllMovies((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH MOVIE DETAILS
exports.getMovie = (req, res) => {
    
    const { name } = req.query

    if (name == undefined || name == null || name.length == 0) {
        res.status(400).send({ error: "Movie name is required" })
        return;
    }

    Movie.getMovie(name, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH ALL GENRES
exports.getMovieGenres = (req, res) => {
    Movie.getMovieGenres((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}


// FETCH MOVIES WITH GENRE
exports.getMoviesWithGenre = (req, res) => {

    const { genre } = req.params

    Movie.getMoviesWithGenre(genre, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}