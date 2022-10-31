const TravelGuide = require('../models/TravelGuide')
const CountryTravelGuide = require('../models/CountryTravelGuide')


// FETCH ALL TRAVEL GUIDES
exports.getAllCountryTravelGuides = (req, res) => {
    
    CountryTravelGuide.getAllCountryTravelGuides((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH ALL TRAVEL GUIDES
exports.getAllTravelGuides = (req, res) => {
    
    TravelGuide.getAllTravelGuides((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH TRAVEL GUIDE DETAILS
exports.getTravelGuide = (req, res) => {
    
    const { name, country } = req.query

    if (name == undefined || name == null || name.length == 0) {
        res.status(400).send({ error: "Travel guide name is required" })
        return;
    } else if (country == undefined || country == null || country.length == 0) {
        res.status(400).send({ error: "Travel guide country is required" })
        return;
    }
    
    TravelGuide.getTravelGuide(name, country, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH MOVIE DETAILS
exports.getAllTravelGuidesByCountry = (req, res) => {
    
    const { title } = req.query  
    
    if (title == undefined || title == null || title.length == 0) {
        res.status(400).send({ error: "Travel guide title is required" })
        return;
    }

    TravelGuide.getTravelGuidePerCountry(title, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}