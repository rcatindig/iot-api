const fs = require('fs');

// Constructor
const Season = function (season) {
    this.title = season.title;
    this.genre = season.genre;
    this.series = season.series;
    this.posterImagePath = season.poster;
};

// GET SEASONS PER SERIES
Season.getSeasonsPerSeries = (genre, series, callback) => {
    const filePath = "./media/series/" + genre + "/" + series;
    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read seasons ", filePath, "\nError: ", error)
            callback("Failed to read seasons", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let season_name = item;
                    let cover = "/default-image.jpg";
                    let pdfPath = "";

                    var files = fs.readdirSync(filePath + "/" + item);

                    files.forEach(file => {
                        var idx = file.lastIndexOf('.');
                        // handle cases like, .htaccess, filename
                        var ext = (idx < 1) ? "" : file.substr(idx + 1);

                        if (ext == "jpg" || ext == "png") {
                            cover = "/series/" + genre + "/" + series +  "/" + item + "/" + file;
                        }
                    });

                    const data = new Season({
                        title: season_name,
                        series: series,
                        poster: cover,
                        genre: genre
                    });

                    results.push(data);
                }
            })

            callback(null, results);
        }
    })
}

module.exports = Season;