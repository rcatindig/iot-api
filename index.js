const express = require("express");
const app = express();
const morgan = require("morgan"); // HTTP request logger middleware
const cors = require("cors");
const cron = require("node-cron"); // use for cron jobs
const https = require("https");

require('dotenv').config()

// Import routes
let routes = require("./routes/api/router.js")

// Import libs
let sysinfo = require("./tasks/sysinfo.js")

// Middlewares
app.use(morgan("combined")) // for more options, refer to https://github.com/expressjs/morgan

const fs = require('fs');
var key = fs.readFileSync('SSL/private.key');
var cert = fs.readFileSync('SSL/primary.crt');
var ca = fs.readFileSync('SSL/intermediate.crt');

var sslOptions= {
  key: key,
  cert: cert,
  ca: ca
};

// CORS
app.use(cors());


// CORS
app.use(cors());

// Body parser
app.use(express.json()); // parse application/json requests
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded requests


// Serve images and media files
const options = {
    dotfiles: "ignore",
    index: false // disable directory indexing
}

app.use('/static', express.static(__dirname + '/media', options));


// =========== START: CRON JOBS ===========

// Getting Temperature
// running every 1 minute based: https://crontab.guru/#*/1_*_*_*_*
cron.schedule('*/1 * * * *', () => { 

    // Memory 
    sysinfo.getMemoryTemperature();
    sysinfo.getNetworkInfo();

});

// =========== END: CRON JOBS ===========

// =========== START: LOAD DEVICE ID INTO MEMORY===========
const Device = require('./models/Device')

Device.getDeviceId((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD DEVICE ID INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - FAILED TO LOAD DEVICE ID INTO CACHE, EMPTY DATA")
        return;
    }
    console.log("INIT - SUCCESSFULLY LOADED DEVICE ID INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.deviceId = data;
})
// =========== END: LOAD DEVICE ID INTO MEMORY =============


// =========== START: LOAD MEDIA DATA INTO MEMORY ===========
// ******* WILL OBSERVE, IF THE SERVER MEMORY CAN HANDLE IT

const Movie = require('./models/Movie')
const Ebook = require('./models/Ebook')
const Audiobook = require('./models/Audiobook')
// const TravelGuide = require('./models/TravelGuide');
const MusicPlaylist = require("./models/MusicPlaylist.js");
const Music = require("./models/Music.js");
const CountryTravelGuide = require("./models/CountryTravelGuide.js");
const Series = require("./models/Series.js");


Movie.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD MOVIES INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO MOVIES WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED MOVIES INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.movies = data;
})

// SERIES
Series.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD SERIES INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO SERIES WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED SERIES INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.series = data;
})

Ebook.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD EBOOKS INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO EBOOKS WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED EBOOKS INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

    global.ebooks = data;
})

Audiobook.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD AUDIOBOOKS INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO AUDIOBOOKS WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED AUDIOBOOKS INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes

    global.audiobooks = data;
})

CountryTravelGuide.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD COUNTRY TRAVEL GUIDE INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO COUNTRY TRAVEL GUIDE WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED COUNTRY TRAVEL GUIDES INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.countryTravelGuides = data;
})

CountryTravelGuide.loadAllGuidesPerCountry((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD TRAVEL GUIDES (PER COUNTRY) INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO TRAVEL GUIDES (PER COUNTRY) WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED TRAVEL GUIDES (PER COUNTRY) INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.travelGuidesPerCountry = data;
})

Music.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD MUSIC INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO MUSIC WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED MUSIC INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.music = data;
})


MusicPlaylist.loadAll((err, data) => {
    if (err) {
        console.log("INIT - FAILED TO LOAD MUSIC PLAYLIST INTO CACHE", err)
        return;
    }

    if (data.length == 0) {
        console.log("INIT - NO MUSIC PLAYLIST WERE FOUND")
        return;
    }

    console.log("INIT - SUCCESSFULLY LOADED MUSIC PLAYLIST INTO CACHE")
    // SET GLOBAL VARIABLE
    // https://stackoverflow.com/questions/9765215/global-variable-in-app-js-accessible-in-routes
    global.musicPlaylist = data;
})



// =========== END: LOAD MEDIA DATA INTO MEMORY ===========


// Set routes
app.use("/api/", routes)


// ERROR HANDLER FOR JSON PARSING ERROR (body-parser)
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(400).send({ error: "JSON parsing error, please provide a valid JSON" });
    } else {
        next();
    }
});


// TODO: add view engine -- pug, handlebar, or ejs

const port = process.env.SERVER_PORT

// Using SSL
https.createServer(sslOptions, app).listen(port, () => {
	console.log("MyFlix IOT Server has started. Running on port " + port);
});

//app.listen(port, () => {
//    console.log("MyFlix IOT Server has started. Running on port " + port);
//