const fs = require('fs')
const { findInCollection } = require('../helpers/findInCollection')

// Constructor
const Series = function (series) {
    this.title = series.series_name;
    this.summary = series.summary;
    this.filePath = series.file_path;
    this.posterImagePath = series.poster;
    this.genres = [series.genre];
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
Series.loadAll = (callback) => {
    const filePath = "./media/series";
    let results = [];

    fs.readdir(filePath, (err, dirs) => {
        if (err) {
            console.log("Failed to read series ", filePath, "\nError: ", err)
            callback("Failed to read series", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let genre = item;
                    var folders = fs.readdirSync(filePath + "/" + item);

                    folders.forEach(folder => {
                        let seriesName = folder;

                        if (fs.lstatSync(filePath + "/" + item + "/" + folder).isDirectory()) {
                            var files = fs.readdirSync(filePath + "/" + item + "/" + folder);

                            let poster = "/default-image.jpg";
                            let pdf = "";
                            let synopsis = "";
                            let author = "";

                            files.forEach(file => {
                                var idx = file.lastIndexOf('.');
                                // handle cases like, .htaccess, filename
                                var ext = (idx < 1) ? "" : file.substr(idx + 1);

                                if (ext == "jpg" || ext == "png") {
                                    poster = "/series" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "pdf") {
                                    pdf = "/series" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "txt") {
                                    if (file == "summary.txt") {
                                        synopsis = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    }
                                }
                            });

                            const data = new Series({
                                series_name: seriesName,
                                summary: synopsis,
                                file_path: pdf,
                                poster: poster,
                                genre: genre,
                            });

                            results.push(data);
                        }
                    })
                }
            })

            callback(null, results);
        }
    })
}


// GET ALL EBOOKS LOADED FROM CACHE
Series.getAllSeries = (callback) => {
    callback(null, global.series)
}

// GET EBOOK DETAILS
Series.getSeries = (title, callback) => {
    const series = global.series.filter(item => {
        return item.title.toLowerCase() == title.toLowerCase()
    })

    if (series.length == 0) {
        callback(null, [])
    } else {
        callback(null, series[0])
    }
}

// GET GENRES
Series.getSeriesGenres = (callback) => {
    const genres = new Set()

    global.series.forEach(series => {
        series.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}


// GET EBOOKS WITH GENRE
Series.getSeriesWithGenre = (genre, callback) => {

    const series = []

    global.series.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                series.push(item)
                return
            }
        });
    })

    callback(null, series)
}

// FIND SERIES
Series.findSeries = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.series, "title");
    callback(null, results)
}


module.exports = Series;