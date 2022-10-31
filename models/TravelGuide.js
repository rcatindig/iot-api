const csv = require('csv-parser')
const fs = require('fs');
const { restart } = require('nodemon');

// Constructor
const TravelGuide = function (travelGuide) {
    this.name = travelGuide.travel_guide_name;
    this.country = travelGuide.country;
    this.summary = travelGuide.summary;
    this.filePath = travelGuide.file_path;
    this.posterImagePath = travelGuide.poster;
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
TravelGuide.loadAll = (callback) => {
    const filePath = './media_csv/myflix_travelguides.csv';
    const results = [];

    fs.createReadStream(filePath)
        .on('error', (error) => {
            console.log("Failed to read CSV file", filePath, "\nError: ", error)
            callback(error, null)
        })
        .pipe(csv())
        .on('data', (data) => {
            let guide = new TravelGuide(data)
            results.push(guide)
        })
        .on('end', () => {
            callback(null, results)
        });
}


// GET ALL TRAVEL GUIDES LOADED FROM CACHE
TravelGuide.getAllTravelGuides = (callback) => {
    callback(null, global.travelGuides)
}

// GET TRAVEL GUIDE DETAILS
TravelGuide.getTravelGuide = (name, country, callback) => {
    const filePath = "./media/travelguides/" + country;
    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read travel guide details ", filePath, "\nError: ", error)
            callback("Failed to read travel guide details", null)
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
                            pdfPath = "/" + country + "/" + item + "/" + file;
                        } else if (ext == "jpg" || ext == "png") {
                            cover = "/" + country + "/" + item + "/" + file;
                        }
                    });

                    if (name == travelguide_name) {
                        const data = new TravelGuide({
                            travel_guide_name: travelguide_name,
                            country: country,
                            poster: cover,
                            file_path: pdfPath,
                            summary: ''
                        });

                        results.push(data);
                    }
                }
            })

            callback(null, results.length > 0 ? results[0] : []);
        }
    })
}


// GET TRAVEL GUIDE PER COUNTRY
TravelGuide.getTravelGuidePerCountry = (folderName, callback) => {
    const filePath = "./media/travelguides/" + folderName;
    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read travel guides per country ", filePath, "\nError: ", error)
            callback("Failed to read travel guides per country", null)
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
                            pdfPath = "/" + folderName + "/" + item + "/" + file;
                        } else if (ext == "jpg" || ext == "png") {
                            cover = "/" + folderName + "/" + item + "/" + file;
                        }
                    });

                    const data = new TravelGuide({
                        travel_guide_name: travelguide_name,
                        country: folderName,
                        poster: cover,
                        file_path: pdfPath,
                        summary: ''
                    });

                    results.push(data);
                }
            })

            callback(null, results);
        }
    })
}

module.exports = TravelGuide;