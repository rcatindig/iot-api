'use strict';
var mysql = require('mysql');

// Define connection to database 

var connection = mysql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER ,
    password : process.env.DB_USER_PASSWORD,
    database : process.env.DB_NAME,
    port     : process.env.DB_PORT
});

module.exports = connection;