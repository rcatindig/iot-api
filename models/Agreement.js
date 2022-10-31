'use strict';
const sql = require('../helpers/database');

// Constructor
const Agreement = function (agreement) {
    this.id = agreement.id;
    this.content = agreement.content;
    this.status = agreement.status;
}

Agreement.getAgreement = (callback) => {
    let query = "SELECT * FROM aggrements";
    sql.query(query, (error, results) => {
        if (error) {
            console.log("Failed to get user agreement: ", error);
            callback("Failed to get user agreement", null);
            return;
        }

        if (results.length == 0) {
            callback(null, []);
            return;
        }

        console.log("Successfully fetched agreement")
        let agreement = new Agreement(results[0])
        callback(null, agreement.content);
    })
}


module.exports = Agreement;