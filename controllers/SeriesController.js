const Series = require('../models/Series')
const Season = require('../models/Season')
const Episode = require('../models/Episode')

// FETCH ALL SERIES
exports.getAllSeries = (req, res) => {

    Series.getAllSeries((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH SEASON DETAILS
exports.getSeries = (req, res) => {

    const { title } = req.query;

    if (title == undefined || title == null || title.length == 0) {
        res.status(400).send({ error: "Series title is required" })
        return;
    }

    Series.getSeries(title, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH ALL GENRES
exports.getSeriesGenres = (req, res) => {

    Series.getSeriesGenres((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH SEASONS WITH GENRE
exports.getSeriesWithGenre = (req, res) => {

    const { genre } = req.params;

    if (genre == undefined || genre == null || genre.length == 0) {
        res.status(400).send({ error: "Series genre is required" })
        return;
    }

    Series.getSeriesWithGenre(genre, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH SERIES SEASONS
exports.getAllSeasonBySeries = (req, res) => {

    const { genre, series } = req.query;

    if (genre == undefined || genre == null || genre.length == 0 ||
        series == undefined || series == null || series.length == 0) {
        res.status(400).send({ error: "Series name and genre is required" })
        return;
    }

    Season.getSeasonsPerSeries(genre, series, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH SERIES SEASONS
exports.getAllEpisodesBySeason = (req, res) => {

    const { genre, series, season } = req.query;

    if (genre == undefined || genre == null || genre.length == 0 ||
        series == undefined || series == null || series.length == 0 ||
        season == undefined || season == null || season.length == 0) {
        res.status(400).send({ error: "Series name, genre, and season is required" })
        return;
    }

    Episode.getEpisodesPerSeason(genre, series, season, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}

// FETCH SERIES SEASONS
exports.getEpisodeDetails = (req, res) => {

    const { genre, series, season, episode } = req.query;

    if (genre == undefined || genre == null || genre.length == 0 ||
        series == undefined || series == null || series.length == 0 ||
        season == undefined || season == null || season.length == 0) {
        res.status(400).send({ error: "Series name, genre, season, and episode is required" })
        return;
    }

    Episode.getEpisodeDetails(genre, series, season, episode, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result } })
    })
}




