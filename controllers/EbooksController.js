const Ebook = require('../models/Ebook')

// FETCH ALL EBOOKS
exports.getAllEbooks = (req, res) => {

    Ebook.getAllEbooks((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH EBOOK DETAILS
exports.getEbook = (req, res) => {
    
    const { title } = req.query

    if (title == undefined || title == null || title.length == 0) {
        res.status(400).send({ error: "Ebook title is required" })
        return;
    }
    
    Ebook.getEbook(title, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH ALL GENRES
exports.getEbookGenres = (req, res) => {
    Ebook.getEbookGenres((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH EBOOKS WITH GENRE
exports.getEbooksWithGenre = (req, res) => {

    const { genre } = req.params

    Ebook.getEbooksWithGenre(genre, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}