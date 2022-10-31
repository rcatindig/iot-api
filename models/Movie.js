const fs = require('fs');
const { findInCollection } = require('../helpers/findInCollection')

// Constructor
const Movie = function (movie) {
    this.name = movie.movie_name;
    this.year = movie.year;
    this.summary = movie.summary;
    this.duration = movie.duration;
    this.filePath = movie.file_path;
    this.posterImagePath = movie.poster1;
    this.bannerImagePath = movie.banner1;
    this.genres = [movie.genre];
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
Movie.loadAll = (callback) => {
    const filePath = "./media/movies";
    let results = [];

    fs.readdir(filePath, (err, dirs) => {
        if (err) {
            console.log("Failed to read movies ", filePath, "\nError: ", err)
            callback("Failed to read movies", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let genre = item;
                    var folders = fs.readdirSync(filePath + "/" + item);

                    folders.forEach(folder => {
                        let movieName = folder;

                        if (fs.lstatSync(filePath + "/" + item + "/" + folder).isDirectory()) {
                            var files = fs.readdirSync(filePath + "/" + item + "/" + folder);

                            let poster = "/default-image.jpg";
                            let moviePath = "";
                            let summary = "";
                            let author = "";
                            let banner = "/default-image.jpg";

                            files.forEach(file => {

                                var idx = file.lastIndexOf('.');
                                // handle cases like, .htaccess, filename
                                var ext = (idx < 1) ? "" : file.substr(idx + 1);

                                if (ext == "jpg" || ext == "png") {
                                    if (file == "banner.jpg" || file == "banner.png") {
                                        banner = "/movies" + "/" + item + "/" + folder + "/" + file;
                                    } else {
                                        poster = "/movies" + "/" + item + "/" + folder + "/" + file;
                                    }
                                } else if (ext == "mp4") {
                                    moviePath = "/movies" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "txt") {
                                    if (file == "summary.txt") {
                                        summary = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    } else if (file == "author.txt") {
                                        author = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    }
                                }
                            });

                            const data = new Movie({
                                movie_name: movieName,
                                year: "",
                                duration: "",
                                summary: summary,
                                file_path: moviePath,
                                poster1: poster,
                                banner1: banner,
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


// GET ALL MOVIES LOADED FROM CACHE
Movie.getAllMovies = (callback) => {
    callback(null, global.movies)
}

// GET MOVIE DETAILS
Movie.getMovie = (name, callback) => {
    const movie = global.movies.filter(item => {
        return item.name.toLowerCase() == name.toLowerCase()
    })

    if (movie.length == 0) {
        callback(null, [])
    } else {
        callback(null, movie[0])
    }
}

// GET ALL MOVIE GENRES
Movie.getMovieGenres = (callback) => {
    const genres = new Set()

    global.movies.forEach(movie => {
        movie.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}

// GET MOVIES WITH GENRE
Movie.getMoviesWithGenre = (genre, callback) => {
    const movies = []

    global.movies.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                movies.push(item)
                return
            }
        });
    })

    callback(null, movies)
}

// FIND MOVIES
Movie.findMovies = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.movies, "name");
    callback(null, results)
}



module.exports = Movie;