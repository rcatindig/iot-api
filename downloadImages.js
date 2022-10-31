const fs = require('fs');
const async = require('async');
const axios = require('axios');
const csv = require('csv-parser');

// CONSTANTS
const DOWNLOAD_CONCURRENCY = 10;
const DIR_LIMIT = 100;
const IMAGES_DIR = "./media_images";
const CSV_DIR = "./details_csv";

// MOVIES CONSTANTS
const MOVIES_DIR_PATH = "./media/movies";
const MOVIES_IMAGES_DIR_PATH = `${IMAGES_DIR}/movies`;
const MOVIES_CSV_FILE_PATH = `${CSV_DIR}/movies_details.csv`;

// SERIES CONSTANTS
const SERIES_DIR_PATH = "./media/series";
const SERIES_IMAGES_DIR_PATH = `${IMAGES_DIR}/series`;
const SERIES_CSV_FILE_PATH = `${CSV_DIR}/series_details.csv`;

// TMDB
// Reference: https://developers.themoviedb.org/3/configuration/get-api-configuration
const TMDB_POSTER_SIZE = "w300";
const TMDB_BANNER_SIZE = "w500";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";


// ===================
//       MODELS
// ===================

// From CSV 
const Movie = function (movie) {
    this.title = movie.title;
    // this.summary = movie.summary; // Uncomment if necessary.
    this.releaseDate = movie.release_date;
    this.posterPath = movie.poster_path;
    this.bannerPath = movie.banner_path;
};

// From CSV 
const Series = function (series) {
    this.title = series.title;
    // this.summary = series.summary; // Uncomment if necessary.
    this.releaseDate = series.release_date;
    this.posterPath = series.poster_path;
    this.bannerPath = series.banner_path;
};

const Image = function (item) {
    this.title = item.title;
    this.type = item.type;
    this.imageUrl = item.imageUrl;
};

// ===================
//       UTILS
// ===================

// REMOVE NON-ALPHANUMERIC CHARACTERS FROM STRING
cleanString = (string) => {
    if (string === null || string === undefined) {
        return string;
    }

    let cleanStr = string.replace(/[^0-9a-z ]/gi, '');
    const lastFourChars = cleanStr.slice(cleanStr.length - 4);
    // Remove year on the movie title (e.g. The Old Guard 2020- > The Old Guard)
    if (!isNaN(Math.round(lastFourChars))) {
        cleanStr = cleanStr.substring(0, cleanStr.length - 4);
    }

    return cleanStr.trim();
}

isNotNull = (item) => {
    if (item === "" || item === null || item === undefined) {
        return false;
    }
    return true;
}

logInfo = (string) => {
    return console.log("\x1b[32m%s\x1b[0m", string)
}

logError = (string) => {
    return console.log("\x1b[31m%s\x1b[0m", string)
}

// ===================

// CREATE IMAGES DIR AND FILE IF IT'S NOT EXISTING
createImagesDir = () => new Promise(async (resolve, reject) => {
    logInfo(`\nChecking '${IMAGES_DIR}' directory...`);

    try {
        if (!fs.existsSync(IMAGES_DIR)) {
            logInfo(`'${IMAGES_DIR}' does not exist, creating directory...`);

            fs.mkdirSync(IMAGES_DIR);
            resolve();
        } else {
            resolve();
        }

    } catch (error) {
        const errMsg = `Failed to create directory. Error: ${error}`;
        logError(errMsg);
        reject(errMsg);
    }
});

// LOAD DETAILS FROM CSV
loadDetailsCsv = (collectionName, csvFilePath) => new Promise((resolve, reject) => {
    logInfo(`\nLoading details from '${csvFilePath}'...`);
    const results = [];

    fs.createReadStream(csvFilePath)
        .on('error', (error) => {
            const errMsg = `Failed read Details CSV file '${csvFilePath}' \nError: ${error}`;
            logError(errMsg);
            reject(errMsg);
            return;
        })
        .pipe(csv())
        .on('data', (data) => {
            switch (collectionName.toLowerCase()) {
                case "movies":
                    let movie = new Movie(data);
                    results.push(movie);
                    break;
                case "series":
                    let series = new Series(data);
                    results.push(series);
                    break;
                default:
                    console.log("Unknown collection", collectionName);
            }
        })
        .on('end', () => {
            logInfo(`\nDone loading ${collectionName} details csv! Details loaded: ${results.length}`);
            resolve(results);
        });
});

// EXTRACT POSTER AND BANNER IMAGE URLS FROM THE LOADED COLLECTION
extractImageUrls = (collectionName, collection) => new Promise((resolve, reject) => {
    logInfo(`\nExtracting ${collectionName} poster and banner image URLs...`);

    const results = [];

    collection.forEach((item) => {
        if (isNotNull(item.posterPath)) {
            results.push(new Image({
                title: item.title,
                type: "poster",
                imageUrl: item.posterPath
            }));
        }

        // Change condition if series needs the banner images
        if (collectionName.toLowerCase() !== "series" && isNotNull(item.bannerPath)) {
            results.push(new Image({
                title: item.title,
                type: "banner",
                imageUrl: item.bannerPath
            }));
        }
    });

    logInfo(`\nFinished extracting ${collectionName} image urls. Image URLS: ${results.length}`);

    resolve(results);
});


// DOWNLOAD MOVIE POSTER AND BANNER IMAGES
downloadImages = (collectionName, imageUrls, collectionImageDir) => new Promise((resolve, reject) => {
    logInfo(`\nFetching ${collectionName} images...\n`);

    logInfo(`Creating download queue...`);

    let failedFetchCtr = 0;
    let successFetchCtr = 0;

    const queue = async.queue((task, callback) => {
        logInfo(`Fetching '${task.item.title}' ${task.item.type} image...`);

        // CREATE DIR IF NOT EXISTING
        const itemDir = `${collectionImageDir}/${task.item.title}/`;

        if (!fs.existsSync(itemDir)) {
            logInfo(`'${itemDir}' does not exist, creating directory...`);
            fs.mkdirSync(itemDir, { recursive: true });
        }

        const imageSize = task.item.type === "poster" ? TMDB_POSTER_SIZE : TMDB_BANNER_SIZE;
        const writer = fs.createWriteStream(`${itemDir}${task.item.type}.jpg`)

        return axios({
            method: 'GET',
            url: `${TMDB_IMAGE_BASE_URL}/${imageSize}/${task.item.imageUrl}`,
            responseType: 'stream',
        }).then(response => {

            //ensure that the user can call `then()` only when the file has
            //been downloaded entirely.

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                let error = null;

                writer.on('error', err => {
                    logError(`Failed to write image to ${itemDir}`);
                    error = err;
                    writer.close();
                    reject(err);
                    callback();
                });

                writer.on('close', () => {
                    if (!error) {
                        successFetchCtr++;
                        resolve(true);
                        callback();
                    }
                });
            });
        })
            .catch((err) => {
                logError(`Failed to write image to ${itemDir}. Error: ${err}`);
                failedFetchCtr++;
                callback();
            });
    }, DOWNLOAD_CONCURRENCY);

    // assign a callback
    queue.drain(() => {
        logInfo(`\nFinished downloading all ${collectionName} images. Successful ${collectionName} images fetched: ${successFetchCtr}, failed fetches: ${failedFetchCtr}\n`);
        resolve();
    });

    // assign an error callback
    queue.error(function (err, task) {
        logError(`Download task experienced an error. Task: ${task} \nError: ${err}`);
        reject(err);
    });

    let taskCtr = 0;
    imageUrls.forEach(item => {
        // add items to the queue
        queue.push({ item: item }, (err) => {
            if (err) {
                logError(`Failed download -- '${item.title}' ${item.type} image`);
            } else {
                logInfo(`Finished download -- '${item.title}' ${item.type} image`);
            }
        });
        taskCtr++;
    });

    // NO IMAGES TO DOWNLOAD, RETURN EMPTY ARRAY
    if (taskCtr === 0) {
        resolve();
    }
});


// ============================================================
//                         START OF SCRIPT
// ============================================================
startDownload = async () => {
    // #######################################################
    //    DOWNLOAD MOVIES IMAGES (poster and banner) BLOCK 
    // #######################################################

    try {
        logInfo("\n>>>Starting download images script for movies...");
        const moviesString = "movies";

        // CREATE IMAGES DIR IF IT DOES NOT EXIST
        await createImagesDir();

        // 1 - LOAD ALL MOVIES FROM CSV INTO MEMORY
        const movies = await loadDetailsCsv(moviesString, MOVIES_CSV_FILE_PATH);

        // 2 - EXTRACT ALL IMAGE URLS FROM MOVIES ARRAY
        const imageUrls = await extractImageUrls(moviesString, movies);

        // 3 - DOWNLOAD POSTER AND BANNER IMAGES OF MOVIES
        downloadImages(moviesString, imageUrls, MOVIES_IMAGES_DIR_PATH);

    } catch (error) {
        logError(`\nFailed to download movie images. Please refer to the logs.\nError: ${error}`);
    }

    // #######################################################
    //    DOWNLOAD SERIES IMAGES (poster and banner) BLOCK 
    // #######################################################

    try {
        logInfo("\n>>>Starting download images script for series...");
        const seriesString = "series";

        // CREATE IMAGES DIR IF IT DOES NOT EXIST
        await createImagesDir();

        // 1 - LOAD ALL SERIES FROM CSV INTO MEMORY
        const series = await loadDetailsCsv(seriesString, SERIES_CSV_FILE_PATH);

        // 2 - EXTRACT ALL IMAGE URLS FROM SERIES ARRAY
        const imageUrls = await extractImageUrls(seriesString, series);

        // 3 - DOWNLOAD POSTER AND BANNER IMAGES OF SERIES
        downloadImages(seriesString, imageUrls, SERIES_IMAGES_DIR_PATH);

    } catch (error) {
        logError(`\nFailed to download series images. Please refer to the logs.\nError: ${error}`);
    }
}

// * Execute this function
startDownload();