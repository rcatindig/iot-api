const async = require('async')
const Movie = require('../models/Movie')
const Series = require('../models/Series')
const Ebook = require('../models/Ebook')
const Audiobook = require('../models/Audiobook')
const Music = require('../models/Music')
const MusicPlaylist = require('../models/MusicPlaylist')
const CountryTravelGuide = require('../models/CountryTravelGuide')

exports.search = (req, res) => {

    const { term, categories, sortBy } = req.query

    if (categories == undefined || categories == null || categories.length == 0) {
        res.status(400).send({ error: "Categories is required" })
        return;
    }

    const categoriesArr = categories.split(",");

    let results = {}

    async.forEachOf(categoriesArr, (value, key, callback) => {
        switch (value.trim().toLowerCase()) {
            case "movies":
                console.log(`Searching for '${term}' in movies`);
                Movie.findMovies(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search movies", err);
                        return callback(err);
                    }

                    results["movies"] = result
                    callback();
                })
                break;

            case "series":
                console.log(`Searching for '${term}' in series`);
                Series.findSeries(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search series", err);
                        return callback(err);
                    }

                    results["series"] = result
                    callback();
                })
                break;

            case "ebooks":
                console.log(`Searching for '${term}' in ebooks`);
                Ebook.findEbooks(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search ebooks", err);
                        return callback(err);
                    }

                    results["ebooks"] = result
                    callback();
                })
                break;

            case "audiobooks":
                console.log(`Searching for '${term}' in audiobooks`);
                Audiobook.findAudiobooks(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search audiobooks", err);
                        return callback(err);
                    }

                    results["audiobooks"] = result
                    callback();
                })
                break;

            case "music":
                console.log(`Searching for '${term}' in music`);
                // Music.findMusic(term, (err, result) => {
                MusicPlaylist.findMusicPlaylists(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search music", err);
                        return callback(err);
                    }

                    results["music"] = result
                    callback();
                })
                break;

            case "travel-guides":
                console.log(`Searching for '${term}' in travel-guides`);
                CountryTravelGuide.findCountryTravelGuides(term, (err, result) => {
                    if (err) {
                        console.log("Failed to search countryTravelGuides", err);
                        return callback(err);
                    }

                    results["countryTravelGuides"] = result
                    callback();
                })
                break;

            default:
                console.log("Unknown category");
                return callback("Unknown category");
        }
    }, (err) => {
        if (err) {
            console.log("Search error:", err)
            res.status(500).send({ error: err })
            return;
        }

        console.log("Search done, sending back results")
        res.send({ data: results });
    });
}

// countryTravelGuides
// MusicPlaylists