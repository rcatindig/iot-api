const fs = require('fs')

// Constructor
const MusicPlaylist = function (MusicPlaylist) {
    this.title = MusicPlaylist.title;
    this.posterImagePath = MusicPlaylist.posterImagePath;
};

// THIS SHOULD ONLY EXECUTE ONCE, ON INIT, TO AVOID READING THE FILE FOR EVERY REQUEST
// - WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT
MusicPlaylist.loadAll = (callback) => {
    const filePath = "./media/musics";

    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read music playlist ", filePath, "\nError: ", error)
            callback("Failed to read music playlist ", null)
        } else {
            dirs.forEach(item => {
                const data = new MusicPlaylist({
                    title: item,
                    posterImagePath: "/musics/" + item + "/poster.png"
                });

                results.push(data);
            })

            callback(null, results);
        }
    })
}


// GET ALL MUSICPLAYLISTS LOADED FROM CACHE
MusicPlaylist.getAllMusicPlaylists = (callback) => {
    callback(null, global.musicPlaylist)
}

// GET MUSICPLAYLISTS DETAILS
MusicPlaylist.getMusicPlaylist = (title, author, callback) => {
    const MusicPlaylist = global.musicPlaylist.filter(item => {
        return item.title.toLowerCase() == title.toLowerCase() &&
            item.author.toLowerCase() == author.toLowerCase()
    })

    if (MusicPlaylist.length == 0) {
        callback(null, [])
    } else {
        callback(null, MusicPlaylist[0])
    }
}

// GET ALL GENRES
MusicPlaylist.getMusicPlaylistGenres = (callback) => {
    const genres = new Set()

    global.musicPlaylist.forEach(MusicPlaylist => {
        MusicPlaylist.genres.forEach(genre => {
            genres.add(genre)
        });
    });

    const genreArray = [...genres].sort()
    callback(null, genreArray)
}


// GET MUSICPLAYLISTS WITH GENRE
MusicPlaylist.getMusicPlaylistsWithGenre = (genre, callback) => {

    const MusicPlaylists = []

    global.musicPlaylist.forEach(item => {
        item.genres.forEach(currentGenre => {
            if (currentGenre.toLowerCase() == genre.toLowerCase()) {
                MusicPlaylists.push(item)
                return
            }
        });
    })

    callback(null, MusicPlaylists)
}


// FIND MUSIC PLAYLISTS
MusicPlaylist.findMusicPlaylists = (searchTerm, callback) => {
    const musicPlaylists = global.musicPlaylist;
    let results = [];

    for (let i = 0; i < musicPlaylists.length; i++) {
        const musicPlaylist = musicPlaylists[i]
        const words = musicPlaylist.title.split(" ")

        for (let j = 0; j < words.length; j++) {
            if (words[j].toLowerCase().startsWith(searchTerm.toLowerCase())) {
                results.push(musicPlaylist)
                break;
            }
        }
    }

    results = results.sort( (a, b) => a.title.localeCompare(b.title, 'en', {'sensitivity': 'base'}));

    callback(null, results)
}


module.exports = MusicPlaylist;