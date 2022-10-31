const async = require('async')
const fs = require('fs')
const { findInCollection } = require('../helpers/findInCollection')
const MusicPlaylist = require('../models/MusicPlaylist')

// Constructor
const Music = function (Music) {
    this.name = Music.name;
    this.singer = Music.singer;
    this.cover = Music.cover;
    this.musicSrc = Music.musicSrc;
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
Music.loadAll = (mainCallback) => {

    let results = [];

    MusicPlaylist.loadAll((err, data) => {
        if (err) {
            console.log("Failed to load music playlists", err)
            mainCallback(err, null)
            return;
        }

        if (data.length > 0) {
            const folderNames = data.map(item => item.title)

            async.forEachOf(folderNames, (value, key, callback) => {
                const filePath = "./media/musics/" + value;

                fs.readdir(filePath, (err, dirs) => {
                    if (err) {
                        console.log("Failed to read music ", filePath, "\nError: ", err)
                        callback("Failed to read music")
                    } else {
                        dirs.forEach(item => {
                            if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                                let album = item;
                                let cover = "/default-image.jpg";
                                let mp3s = [];

                                var files = fs.readdirSync(filePath + "/" + item);

                                files.forEach(file => {
                                    var idx = file.lastIndexOf('.');
                                    // handle cases like, .htaccess, filename
                                    var ext = (idx < 1) ? "" : file.substr(idx + 1);

                                    if (ext == "mp3") {
                                        mp3s.push(file);
                                    } else if (ext == "jpg" || ext == "png") {
                                        cover = value + "/" + item + "/" + file;
                                    }
                                })

                                mp3s.forEach(mp3 => {
                                    const data = new Music({
                                        name: mp3.split('.').slice(0, -1).join('.'),
                                        singer: album,
                                        cover: cover,
                                        musicSrc: value + "/" + item + "/" + mp3
                                    });

                                    results.push(data);
                                })
                            }
                        })
                        callback();
                    }
                })
            }, (err) => {
                if (err) {
                    console.log("Failed to load all music:", err)
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


Music.getMusicByFolderName = (folderName, callback) => {



    const filePath = "./media/musics/" + folderName;

    let results = [];

    fs.readdir(filePath, (err, dirs) => {
        if (err) {
            console.log("Failed to read music ", filePath, "\nError: ", err)
            callback("Failed to read music", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let album = item;
                    let cover = "/default-image.jpg";
                    let mp3s = [];

                    var files = fs.readdirSync(filePath + "/" + item);

                    files.forEach(file => {
                        var idx = file.lastIndexOf('.');
                        // handle cases like, .htaccess, filename
                        var ext = (idx < 1) ? "" : file.substr(idx + 1);

                        if (ext == "mp3") {
                            mp3s.push(file);
                        } else if (ext == "jpg" || ext == "png") {
                            cover = folderName + "/" + item + "/" + file;
                        }
                    })

                    mp3s.forEach(mp3 => {
                        const data = new Music({
                            name: mp3.split('.').slice(0, -1).join('.'),
                            singer: album,
                            cover: cover,
                            musicSrc: folderName + "/" + item + "/" + mp3
                        });

                        results.push(data);
                    })
                }
            })

            callback(null, results);
        }
    })
}


// GET ALL MUSIC LOADED FROM CACHE
Music.getAllMusics = (callback) => {
    callback(null, global.Musics)
}

// GET MUSIC DETAILS
Music.getMusic = (title, author, callback) => {
    const Music = global.Musics.filter(item => {
        return item.title.toLowerCase() == title.toLowerCase() &&
            item.author.toLowerCase() == author.toLowerCase()
    })

    if (Music.length == 0) {
        callback(null, [])
    } else {
        callback(null, Music[0])
    }
}

// GET ALL GENRES
Music.getMusicGenres = (callback) => {
    const genres = new Set()

    global.Musics.forEach(Music => {
        Music.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}


// GET MUSIC WITH GENRE
Music.getMusicsWithGenre = (genre, callback) => {

    const Musics = []

    global.Musics.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                Musics.push(item)
                return
            }
        });
    })

    callback(null, Musics)
}

// FIND MUSIC
Music.findMusic = (searchTerm, callback) => {
    const results = findInCollection(searchTerm, global.music, "name");
    callback(null, results)
}


module.exports = Music;