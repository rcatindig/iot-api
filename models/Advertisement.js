'use strict';
const { raw } = require('mysql');
const sql = require('../helpers/database');
const Movie = require('./Movie');
const Vehicle = require('./Vehicle');

const Advertisement = function (advertisement) {
    this.id = advertisement.id;
    this.imageUrl = advertisement.ads_image;
    this.link = advertisement.ads_link;
    this.status = advertisement.status;
}


// GET RANDOM INT FROM 0 TO MAX - 1
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

Advertisement.findAll = (callback) => {
    // TODO PROMISIFY THESE QUERIES
    // https://stackoverflow.com/questions/54730641/node-js-how-to-apply-util-promisify-to-mysql-pool-in-its-simplest-way
    Vehicle.getOperatorId((err, data) => {
        if (err) {
            callback(err, null)
            return;
        }

        if (data.length == 0) {
            console.log("No operator id was found")
            callback(null, "");
            return;
        }

        const operatorId = data;

        // Get the size of stored movies
        Movie.getAllMovies((err, result) => {
            if (err) {
                console.log("Failed to get length of movies:", err)
                callback("Failed to get advertisements", null)
                return;
            }

            const adsToQuery = Math.floor(result.length / 3)

            let query = "SELECT * FROM advertisements WHERE operator = ? AND status = 1"
            sql.query(query, [operatorId], (error, results) => {
                if (error) {
                    console.log("Failed to get advertisements: ", error);
                    callback("Failed to get advertisements", null);
                    return;
                }

                if (results.length == 0) {
                    callback(null, "");
                    return;
                }

                // RANDOMIZE ADS
                const limit = results.length < adsToQuery ? results.length : adsToQuery;
                const randomAds = [];
                const randomIndices = new Set()

                while (randomAds.length != limit) {
                    let randomIndex = getRandomInt(results.length)

                    if (!randomIndices.has(randomIndex)) {
                        randomIndices.add(randomIndex);
                        randomAds.push(results[randomIndex]);
                    }
                }

                console.log("Successfully fetched advertisements")

                const advertisements = randomAds.map(rawAd => {
                    return new Advertisement({
                        id: rawAd.id,
                        ads_image: process.env.ADMIN_ASSETS_URL + "/ads/" + rawAd.ads_image,
                        ads_link: rawAd.ads_link,
                        status: rawAd.status
                    })
                })

                callback(null, advertisements);
            })
        })
    })

}


module.exports = Advertisement;