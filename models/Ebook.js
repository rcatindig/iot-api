const fs = require('fs')
const { findInCollection } = require('../helpers/findInCollection')

// Constructor
const Ebook = function (ebook) {
    this.title = ebook.ebook_name;
    this.author = ebook.author;
    this.summary = ebook.summary;
    this.filePath = ebook.file_path;
    this.posterImagePath = ebook.poster;
    this.genres = [ebook.genre];
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
Ebook.loadAll = (callback) => {
    const filePath = "./media/ebooks";
    let results = [];

    fs.readdir(filePath, (err, dirs) => {
        if (err) {
            console.log("Failed to read ebooks ", filePath, "\nError: ", err)
            callback("Failed to read ebooks", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let genre = item;
                    var folders = fs.readdirSync(filePath + "/" + item);

                    folders.forEach(folder => {
                        let ebookName = folder;

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
                                    poster = "/ebooks" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "pdf") {
                                    pdf = "/ebooks" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "txt") {
                                    if (file == "synopsis.txt") {
                                        synopsis = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    } else if (file == "author.txt") {
                                        author = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    }
                                }
                            });

                            const data = new Ebook({
                                ebook_name: ebookName,
                                author: author,
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
Ebook.getAllEbooks = (callback) => {
    callback(null, global.ebooks)
}

// GET EBOOK DETAILS
Ebook.getEbook = (title, callback) => {
    const ebook = global.ebooks.filter(item => {
        return item.title.toLowerCase() == title.toLowerCase()
    })

    if (ebook.length == 0) {
        callback(null, [])
    } else {
        callback(null, ebook[0])
    }
}

// GET GENRES
Ebook.getEbookGenres = (callback) => {
    const genres = new Set()

    global.ebooks.forEach(ebook => {
        ebook.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}


// GET EBOOKS WITH GENRE
Ebook.getEbooksWithGenre = (genre, callback) => {

    const ebooks = []

    global.ebooks.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                ebooks.push(item)
                return
            }
        });
    })

    callback(null, ebooks)
}

// FIND EBOOKS
Ebook.findEbooks = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.ebooks, "title");
    callback(null, results)
}


module.exports = Ebook;