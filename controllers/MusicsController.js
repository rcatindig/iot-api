const MusicPlaylist = require('../models/MusicPlaylist')
const Music = require('../models/Music')

// FETCH ALL TRAVEL GUIDES
exports.getAllMusicPlaylists = (req, res) => {
    
    MusicPlaylist.getAllMusicPlaylists((err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}

// FETCH MOVIE DETAILS
exports.getMusicsByFolder = (req, res) => {
    
    const { title } = req.query;   

    Music.getMusicByFolderName(title, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: result }})
    })
}