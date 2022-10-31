const fs = require('fs');

// Constructor
const Episode = function (episode) {
    this.title = episode.title;
    this.genre = episode.genre;
    this.series = episode.series;
    this.season = episode.season;
    this.posterImagePath = episode.poster;
    this.videoPath = episode.videoPath;
};


// GET EPISODE PER SEASON
Episode.getEpisodesPerSeason = (genre, series, season, callback) => {
    const filePath = "./media/series/" + genre + "/" + series + "/" + season;
    let results = [];

    fs.readdir(filePath, (error, dirs) => {
        if (error) {
            console.log("Failed to read episodes ", filePath, "\nError: ", error)
            callback("Failed to read episodes", null)
        } else {
            dirs.forEach(item => {
                if (fs.lstatSync(filePath + "/" + item).isDirectory()) {
                    let episode_name = item;
                    let cover = "/default-image.jpg";
                    let pdfPath = "";

                    var files = fs.readdirSync(filePath + "/" + item);

                    files.forEach(file => {
                        var idx = file.lastIndexOf('.');
                        // handle cases like, .htaccess, filename
                        var ext = (idx < 1) ? "" : file.substr(idx + 1);

                        if (ext == "jpg" || ext == "png") {
                            cover = "/series/" + genre + "/" + series + "/" + season + "/" + item + "/" + file;
                        }
                    });

                    const data = new Episode({
                        title: episode_name,
                        series: series,
                        season: season,
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

// GET EPISODE DETAILS
Episode.getEpisodeDetails = (genre, series, season, episode, callback) => {
    const filePath = "./media/series/" + genre + "/" + series + "/" + season + "/" + episode;

    fs.readdir(filePath, (error, items) => {
        if (error) {
            console.log("Failed to read episode details ", filePath, "\nError: ", error)
            callback("Failed to read episode details", null)
        } else {
            let episode_name = episode;
            let cover = "/default-image.jpg";
            let videoPath = "";

            items.forEach(file => {
                var idx = file.lastIndexOf('.');
                // handle cases like, .htaccess, filename
                var ext = (idx < 1) ? "" : file.substr(idx + 1);

                if (ext == "jpg" || ext == "png") {
                    cover = "/series/" + genre + "/" + series + "/" + season + "/" + episode + "/" + file;
                } else if (ext == "mp4") {
                    videoPath = "/series/" + genre + "/" + series + "/" + season + "/" + episode + "/" + file;
                }

            });

            const data = new Episode({
                title: episode_name,
                series: series,
                season: season,
                poster: cover,
                genre: genre,
                videoPath: videoPath
            });

            callback(null, data);
        }
    })
}

module.exports = Episode;