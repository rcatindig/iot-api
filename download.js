const fs = require('fs');
const async = require('async');
const axios = require('axios');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// COMMON CONSTANTS
const DOWNLOAD_CONCURRENCY = 10;
const NUM_OF_ROWS_LIMIT = 100;
const CSV_DIR = "./details_csv/";
const CSV_FILE_HEADERS = ["title", "summary", "release_date", "poster_path", "banner_path"];

// MOVIES CONSTANTS
const MOVIES_DIR_PATH = "./media/movies";
const MOVIES_CSV_FILE_NAME = "movies_details.csv"
const MOVIES_CSV_FILE_PATH = `${CSV_DIR}${MOVIES_CSV_FILE_NAME}`;

// SERIES CONSTANTS
const SERIES_DIR_PATH = "./media/series";
const SERIES_CSV_FILE_NAME = "series_details.csv"
const SERIES_CSV_FILE_PATH = `${CSV_DIR}${SERIES_CSV_FILE_NAME}`;

// TMDB
const TMDB_API_KEY = "fe102e5cc3ab1da79ea92a9cbe4e7ca4";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";


// ===================
//       MODELS
// ===================

// From CSV 
const Movie = function (movie) {
    this.title = movie.title;
    this.summary = movie.summary;
    this.releaseDate = movie.release_date;
    this.posterPath = movie.poster_path;
    this.bannerPath = movie.banner_path;
};

// From CSV 
const Series = function (series) {
    this.title = series.title;
    this.summary = series.summary;
    this.releaseDate = series.release_date;
    this.posterPath = series.poster_path;
    this.bannerPath = series.banner_path;
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

findTitleInCollection = (collection, searchTerm) => {
    for (let i = 0; i < collection.length; i++) {
        if (collection[i].title.toLowerCase() === searchTerm.toLowerCase()) {
            return true;
        }
    }
    return false
}

logInfo = (string) => {
    return console.log("\x1b[32m%s\x1b[0m", string)
}

logError = (string) => {
    return console.log("\x1b[31m%s\x1b[0m", string)
}

// ===================


// CREATE CSV DIR AND FILE IF IT'S NOT EXISTING
createCsvDetailsFile = (csvFilePath, csvFileName) => new Promise(async (resolve, reject) => {
    logInfo(`\nChecking CSV file '${csvFilePath}'...`);

    const path = csvFilePath;
    const initialContent = `${CSV_FILE_HEADERS.join(",")}\n`;

    try {
        if (!fs.existsSync(CSV_DIR)) {
            logInfo(`'${CSV_DIR}' does not exist, creating directory...`);

            fs.mkdirSync(CSV_DIR);
        }

        if (!fs.existsSync(csvFilePath)) {
            logInfo(`File '${csvFileName}' not found, creating csv file...`);

            fs.writeFile(path, initialContent, (err) => {
                if (err) {
                    const errMsg = `Failed to write to csv: ${err}`;
                    logError(errMsg);
                    reject(errMsg);
                } else {
                    logInfo(`Succesfully created file '${path}'`);
                    resolve();
                }
            });
        } else {
            resolve();
        }
    } catch (error) {
        const errMsg = `Failed to create csv file. Error: ${error}`;
        logError(errMsg);
        reject(errMsg);
    }
});


// LOAD ITEMS FROM DIRECTORY
loadItemsFromDir = (collectionName, collectionDir) => new Promise((resolve, reject) => {
    logInfo(`\nLoading ${collectionName} from '${collectionDir}'...`);

    const results = [];

    fs.readdir(collectionDir, (error, dirs) => {
        if (error) {
            const errMsg = `Failed to read ${collectionName} '${collectionDir}' \nError: ${error}`;
            logError(errMsg);
            reject(errMsg);
            return;
        }

        dirs.forEach(folder => {
            const path = collectionDir + "/" + folder;

            if (fs.lstatSync(path).isDirectory()) {
                const items = fs.readdirSync(path);

                items.forEach(item => {
                    if (!item.startsWith(".")) {
                        const title = cleanString(item);
                        results.push(title);
                    }
                });
            }
        })

        logInfo(`Done loading ${collectionName}! Items loaded: ${results.length}`);

        resolve(results);
    });
});


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
            logInfo(`Done loading ${collectionName} details csv! Details loaded: ${results.length}`);
            resolve(results);
        });
});


// FETCH MOVIE DETAILS FROM TDMB API
fetchMovieDetails = (loadedMovies, csvMovieDetails) => new Promise((resolve, reject) => {
    logInfo(`\nFetching movie details...\n`);

    logInfo(`Creating download queue...`);

    let failedMovieFetchCtr = 0;
    const fetchedDetails = [];

    const queue = async.queue((task, callback) => {
        logInfo(`Fetching '${task.title}' details...`);

        axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                language: "en",
                include_adult: false,
                query: task.title
            }
        })
            .then(response => {
                if (response && response.data !== null &&
                    response.data.results !== null) {
                    fetchedDetails.push({
                        title: task.title,
                        summary: response.data.results[0].overview,
                        releaseDate: response.data.results[0].release_date,
                        posterPath: response.data.results[0].poster_path,
                        bannerPath: response.data.results[0].backdrop_path,
                    });
                }
                callback();
            })
            .catch(error => {
                failedMovieFetchCtr++;
                logError(`Failed to fetch '${task.title}' details: ${error}`);
                callback();
            })
    }, DOWNLOAD_CONCURRENCY);

    // assign a callback
    queue.drain(() => {
        logInfo(`\nFinished downloading all movie details. Successful Movie Details fetched: ${fetchedDetails.length}, failed fetches: ${failedMovieFetchCtr}`);
        resolve(fetchedDetails);
    });

    // assign an error callback
    queue.error(function (err, task) {
        logError(`Download task experienced an error. Task: ${task} \nError: ${err}`);
        reject(err);
    });

    let taskCtr = 0;
    loadedMovies.forEach(item => {
        // If the movie has an existing record on csv file, skip it
        let hasDetailsOnCsv = findTitleInCollection(csvMovieDetails, item);

        if (!hasDetailsOnCsv) {
            // add some items to the queue
            queue.push({ title: item }, (err) => {
                if (err) {
                    logError(`Failed download -- ${item} details`);
                } else {
                    logInfo(`Finished download -- ${item} details`);
                }
            });
            taskCtr++;
        }
    });

    // NO MOVIES TO DOWNLOAD, RETURN EMPTY ARRAY
    if (taskCtr === 0) {
        resolve([]);
    }
});


// FETCH SERIES DETAILS FROM TDMB API
fetchSeriesDetails = (loadedSeries, csvSeriesDetails) => new Promise((resolve, reject) => {
    logInfo(`\nFetching series details...\n`);

    logInfo(`Creating download queue...`);

    let failedSeriesFetchCtr = 0;
    const fetchedDetails = [];

    const queue = async.queue((task, callback) => {
        logInfo(`Fetching '${task.title}' details...`);

        axios.get(`${TMDB_BASE_URL}/search/tv`, {
            params: {
                api_key: TMDB_API_KEY,
                language: "en",
                include_adult: false,
                query: task.title
            }
        })
            .then(response => {
                if (response && response.data !== null &&
                    response.data.results !== null) {
                    fetchedDetails.push({
                        title: task.title,
                        summary: response.data.results[0].overview,
                        releaseDate: response.data.results[0].release_date,
                        posterPath: response.data.results[0].poster_path,
                        bannerPath: response.data.results[0].backdrop_path,
                    });
                }
                callback();
            })
            .catch(error => {
                failedSeriesFetchCtr++;
                logError(`Failed to fetch '${task.title}' details: ${error}`);
                callback();
            })
    }, DOWNLOAD_CONCURRENCY);

    // assign a callback
    queue.drain(() => {
        logInfo(`\nFinished downloading all series details. Successful Series Details fetched: ${fetchedDetails.length}, failed fetches: ${failedSeriesFetchCtr}`);
        resolve(fetchedDetails);
    });

    // assign an error callback
    queue.error(function (err, task) {
        logError(`Download task experienced an error. Task: ${task} \nError: ${err}`);
        reject(err);
    });

    let taskCtr = 0;
    loadedSeries.forEach(item => {
        // If the series has an existing record on csv file, skip it
        let hasDetailsOnCsv = findTitleInCollection(csvSeriesDetails, item);

        if (!hasDetailsOnCsv) {
            // add some items to the queue
            queue.push({ title: item }, (err) => {
                if (err) {
                    logError(`Failed download -- ${item} details`);
                } else {
                    logInfo(`Finished download -- ${item} details`);
                }
            });
            taskCtr++;
        }
    });

    // NO SERIES TO DOWNLOAD, RETURN EMPTY ARRAY
    if (taskCtr === 0) {
        resolve([]);
    }
});


// WRITE FETCHED DETAILS TO THE CSV FILE
writeToDetailsCsv = (downloadedDetails, csvFilePath) => new Promise((resolve, reject) => {
    logInfo(`\nWriting fetched details to '${csvFilePath}'...`);

    const csvWriter = createCsvWriter({
        append: true,
        path: csvFilePath,
        header: [
            { id: 'title', title: CSV_FILE_HEADERS[0] },
            { id: 'summary', title: CSV_FILE_HEADERS[1] },
            { id: 'releaseDate', title: CSV_FILE_HEADERS[2] },
            { id: 'posterPath', title: CSV_FILE_HEADERS[3] },
            { id: 'bannerPath', title: CSV_FILE_HEADERS[4] },
        ]
    });

    csvWriter.writeRecords(downloadedDetails)
        .then(() => {
            logInfo(`\nFinished writing fetched details to CSV '${csvFilePath}'`);
            resolve();
        })
        .catch((err) => {
            logError(`Failed to write to CSV '${csvFilePath}': ${err}`);
            reject(err);
        });
});


truncateCsvFile = (collectionName, csvFilePath) => new Promise(async (resolve, reject) => {
    logInfo(`\nChecking if ${collectionName} details CSV file needs to be truncated...`);

    let csvDetails = await loadDetailsCsv(collectionName, csvFilePath);

    const totalDetails = csvDetails.length

    if (totalDetails > NUM_OF_ROWS_LIMIT) {
        const itemsToDelete = totalDetails - NUM_OF_ROWS_LIMIT;
        csvDetails.splice(0, itemsToDelete);

        logInfo(`Truncating ${collectionName} details CSV file... Limit: ${NUM_OF_ROWS_LIMIT}, Total Rows: ${totalDetails}, Items to be truncated: ${itemsToDelete}`);

        const csvWriter = createCsvWriter({
            append: false,
            path: csvFilePath,
            header: [
                { id: 'title', title: CSV_FILE_HEADERS[0] },
                { id: 'summary', title: CSV_FILE_HEADERS[1] },
                { id: 'releaseDate', title: CSV_FILE_HEADERS[2] },
                { id: 'posterPath', title: CSV_FILE_HEADERS[3] },
                { id: 'bannerPath', title: CSV_FILE_HEADERS[4] },
            ]
        });

        csvWriter.writeRecords(csvDetails)
            .then(() => {
                logInfo(`\nFinished writing truncated details to CSV '${csvFilePath}'. Truncated items: ${itemsToDelete}`);
                resolve();
            })
            .catch((err) => {
                logError(`Failed to write truncated details to CSV '${csvFilePath}': ${err}`);
                reject(err);
            });
    } else {
        logInfo(`\nTotal ${collectionName} details csv rows are within limits (LIMIT=${NUM_OF_ROWS_LIMIT}). Nothing to truncate.`);
        resolve();
    }
});


// ============================================================
//                         START OF SCRIPT
// ============================================================
// Execute this function
startDownload = async () => {
    // ###############################################
    //          DOWNLOAD MOVIES DETAILS BLOCK 
    // ###############################################

    try {
        logInfo("\n>>>Starting download script for movies...");
        const moviesString = "movies";
        // CREATE DETAILS CSV FILE IF IT DOES NOT EXIST
        await createCsvDetailsFile(MOVIES_CSV_FILE_PATH, MOVIES_CSV_FILE_NAME);

        // 1 - LOAD ALL MOVIES FROM DIRECTORY INTO MEMORY
        let loadedMovies = await loadItemsFromDir(moviesString, MOVIES_DIR_PATH);

        // 2 - LOAD THE CONTENTS OF THE CSV FOR MOVIE DETAILS ON MEMORY
        let csvMovieDetails = await loadDetailsCsv(moviesString, MOVIES_CSV_FILE_PATH);

        // 3 - CHECK IF THERE ARE NEW MOVIES WITHOUT DETAILS, AND DOWNLOAD THEIR DETAILS
        let downloadedMovieDetails = await fetchMovieDetails(loadedMovies, csvMovieDetails);

        if (downloadedMovieDetails.length === 0) {
            logInfo("\nNo new movies detected. Nothing to download. Done.");
        } else {
            // 4 - APPEND THE DOWNLOADED DETAILS TO THE CSV FILE
            await writeToDetailsCsv(downloadedMovieDetails, MOVIES_CSV_FILE_PATH);

            // 5 - IF TOTAL ITEMS ON CSV FILE > $NUM_OF_ROWS_LIMIT, MAKE SURE THERE'S ONLY $NUM_OF_ROWS_LIMIT
            await truncateCsvFile(moviesString, MOVIES_CSV_FILE_PATH);

            logInfo("\nDownload movie details complete!");
        }
    } catch (error) {
        logError(`\nFailed to download movie details. Please refer to the logs.\nError: ${error}`);
    }

    // ###############################################
    //          DOWNLOAD SERIES DETAILS BLOCK 
    // ###############################################

    try {
        logInfo("\n\n>>>Starting download script for series...");
        const seriesString = "series";
        // CREATE DETAILS CSV FILE IF IT DOES NOT EXIST
        await createCsvDetailsFile(SERIES_CSV_FILE_PATH, SERIES_CSV_FILE_NAME);

        // 1 - LOAD ALL SERIES FROM DIRECTORY INTO MEMORY
        let loadedSeries = await loadItemsFromDir(seriesString, SERIES_DIR_PATH);

        // 2 - LOAD THE CONTENTS OF THE CSV FOR SERIES DETAILS ON MEMORY
        let csvSeriesDetails = await loadDetailsCsv(seriesString, SERIES_CSV_FILE_PATH);

        // 3 - CHECK IF THERE ARE NEW SERIES WITHOUT DETAILS, AND DOWNLOAD THEIR DETAILS
        let downloadedSeriesDetails = await fetchSeriesDetails(loadedSeries, csvSeriesDetails);

        if (downloadedSeriesDetails.length === 0) {
            logInfo("\nNo new series detected. Nothing to download. Done.");
        } else {
            // 4 - APPEND THE DOWNLOADED DETAILS TO THE CSV FILE
            await writeToDetailsCsv(downloadedSeriesDetails, SERIES_CSV_FILE_PATH);

            // 5 - IF TOTAL ITEMS ON CSV FILE > $NUM_OF_ROWS_LIMIT, MAKE SURE THERE'S ONLY $NUM_OF_ROWS_LIMIT
            await truncateCsvFile(seriesString, SERIES_CSV_FILE_PATH);

            logInfo("\nDownload series details complete!");
        }
    } catch (error) {
        logError(`\nFailed to download series details. Please refer to the logs.\nError: ${error}`);
    }
}

// ============================================================
//                         END OF SCRIPT
// ============================================================

// * Execute the script
startDownload();