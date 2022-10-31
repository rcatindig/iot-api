const fs = require('fs')
const async = require('async')
const { findInCollection } = require('../helpers/findInCollection')
const TravelGuide = require('../models/TravelGuide')

// Constructor
const CountryTravelGuide = function (travelGuide) {
    this.title = travelGuide.title;
    this.posterImagePath = travelGuide.posterImagePath;
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
CountryTravelGuide.loadAll = (callback) => {
    const filePath = "./media/travelguides";
    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read travel guides ", filePath, "\nError: ", error)
            callback("Failed to read travel guides", null)
        } else {
            dirs.forEach(item => {
                // make sure hidden files are not included
                if (item.charAt(0) != ".") {
                    const data = new CountryTravelGuide({
                        title: item,
                        posterImagePath: "/travelguides/" + item + "/" + item + ".jpg"
                    });

                    results.push(data);
                }
            })

            callback(null, results);
        }
    });
}

// LOAD ALL GUIDES PER COUNTRY INTO MEMORY
// TODO -- REWRITE THIS MAKE IT SHORTER, AND MORE EFFICIENT
CountryTravelGuide.loadAllGuidesPerCountry = (mainCallback) => {

    let results = [];

    CountryTravelGuide.loadAll((err, data) => {
        if (err) {
            console.log("Failed to load country travel guides", err)
            mainCallback(err, null)
            return;
        }

        if (data.length > 0) {
            const countries = data.map(item => item.title)

            async.forEachOf(countries, (value, key, callback) => {
                const filePath = "./media/travelguides/" + value;

                fs.readdir(filePath, (error, dirs) => {
                    if (error) {
                        console.log("Failed to read travel guides per country ", filePath, "\nError: ", error)
                        return callback("Failed to read travel guides per country")
                    } else {
                        dirs.forEach(item => {
                            if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                                let travelguide_name = item;
                                let cover = "/default-image.jpg";
                                let pdfPath = "";

                                var files = fs.readdirSync(filePath + "/" + item);

                                files.forEach(file => {
                                    var idx = file.lastIndexOf('.');
                                    // handle cases like, .htaccess, filename
                                    var ext = (idx < 1) ? "" : file.substr(idx + 1);

                                    if (ext == "pdf") {
                                        pdfPath = "/" + value + "/" + item + "/" + file;
                                    } else if (ext == "jpg" || ext == "png") {
                                        cover = "/" + value + "/" + item + "/" + file;
                                    }
                                });

                                const data = new TravelGuide({
                                    travel_guide_name: travelguide_name,
                                    country: value,
                                    poster: cover,
                                    file_path: pdfPath,
                                    summary: ''
                                });

                                results.push(data);
                            }
                        })
                        callback();
                    }
                })
            }, (err) => {
                if (err) {
                    console.log("Failed to Load Travel Guides (per Country):", err)
                    mainCallback(err, null)
                    return;
                }
                mainCallback(null, results)
            });
        } else {
            mainCallback(null, results)
        }
    })
}


// GET ALL TRAVEL GUIDES LOADED FROM CACHE
CountryTravelGuide.getAllCountryTravelGuides = (callback) => {
    callback(null, global.countryTravelGuides)
}

// GET TRAVEL GUIDE DETAILS
CountryTravelGuide.getCountryTravelGuide = (name, country, callback) => {
    const guide = global.travelGuides.filter(item => {
        return item.name.toLowerCase() == name.toLowerCase() &&
            item.country.toLowerCase() == country.toLowerCase()
    })

    if (guide.length == 0) {
        callback(null, [])
    } else {
        callback(null, guide[0])
    }
}

// FIND TRAVEL GUIDES
CountryTravelGuide.findCountryTravelGuides = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.travelGuidesPerCountry, "name");
    callback(null, results)
}


module.exports = CountryTravelGuide;