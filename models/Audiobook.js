const fs = require('fs')
const { findInCollection } = require('../helpers/findInCollection')

// Constructor
const Audiobook = function (audiobook) {
    this.title = audiobook.audiobook_name;
    this.author = audiobook.author;
    this.summary = audiobook.summary;
    this.filePath = audiobook.file_path;
    this.audioPath = audiobook.audio_path;
    this.posterImagePath = audiobook.poster;
    this.genres = [audiobook.genre];
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
Audiobook.loadAll = (callback) => {
    const filePath = "./media/audiobooks";
    let results = [];

    fs.readdir(filePath, (err, dirs) => {
        if (err) {
            console.log("Failed to read audiobooks ", filePath, "\nError: ", err)
            callback("Failed to read audiobooks ", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let genre = item;
                    var folders = fs.readdirSync(filePath + "/" + item);

                    folders.forEach(folder => {
                        let audioBookName = folder;

                        if (fs.lstatSync(filePath + "/" + item + "/" + folder).isDirectory()) {
                            var files = fs.readdirSync(filePath + "/" + item + "/" + folder);

                            let poster = "/default-image.jpg";
                            let pdf = "";
                            let synopsis = "";
                            let author = "";
                            let audioPath = "";

                            files.forEach(file => {
                                var idx = file.lastIndexOf('.');
                                // handle cases like, .htaccess, filename
                                var ext = (idx < 1) ? "" : file.substr(idx + 1);

                                if (ext == "jpg" || ext == "png") {
                                    poster = "/audiobooks" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "pdf") {
                                    pdf = "/audiobooks" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "mp3") {
                                    audioPath = "/audiobooks" + "/" + item + "/" + folder + "/" + file;
                                } else if (ext == "txt") {
                                    if (file == "synopsis.txt") {
                                        synopsis = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    } else if (file == "author.txt") {
                                        author = fs.readFileSync(filePath + "/" + item + "/" + folder + "/" + file, { encoding: 'utf8', flag: 'r' });
                                    }
                                }
                            });

                            const data = new Audiobook({
                                audiobook_name: audioBookName,
                                author: author,
                                summary: synopsis,
                                file_path: pdf,
                                poster: poster,
                                genre: genre,
                                audio_path: audioPath
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


// GET ALL AUDIOBOOKS LOADED FROM CACHE
Audiobook.getAllAudiobooks = (callback) => {
    callback(null, global.audiobooks)
}

// GET AUDIOBOOK DETAILS
Audiobook.getAudiobook = (title, callback) => {
    const audiobook = global.audiobooks.filter(item => {
        return item.title.toLowerCase() == title.toLowerCase()
    })

    if (audiobook.length == 0) {
        callback(null, [])
    } else {
        callback(null, audiobook[0])
    }
}

// GET ALL GENRES
Audiobook.getAudiobookGenres = (callback) => {
    const genres = new Set()

    global.audiobooks.forEach(audiobook => {
        audiobook.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}


// GET AUDIOBOOKS WITH GENRE
Audiobook.getAudiobooksWithGenre = (genre, callback) => {

    const audiobooks = []

    global.audiobooks.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                audiobooks.push(item)
                return
            }
        });
    })

    callback(null, audiobooks)
}

// FIND AUDIOBOOKS
Audiobook.findAudiobooks = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.audiobooks, "title");
    callback(null, results)
}

module.exports = Audiobook;