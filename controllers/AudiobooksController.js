const Audiobook = require('../models/Audiobook')

// FETCH ALL AUDIOBOOKS
exports.getAllAudiobooks = (req, res) => {

    Audiobook.getAllAudiobooks((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH AUDIOBOOK DETAILS
exports.getAudiobook = (req, res) => {
    
    const { title } = req.query

    if (title == undefined || title == null || title.length == 0) {
        res.status(400).send({ error: "Audiobook title is required" })
        return;
    }
    
    Audiobook.getAudiobook(title, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH ALL GENRES
exports.getAudiobookGenres = (req, res) => {
    Audiobook.getAudiobookGenres((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}


// FETCH EBOOKS WITH GENRE
exports.getAudiobooksWithGenre = (req, res) => {

    const { genre } = req.params

    Audiobook.getAudiobooksWithGenre(genre, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}