const sql = require("../helpers/database");
const moment = require("moment");
const { duration } = require("moment");

// Constructor
const Purchase = function (purchase) {
    this.email = purchase.email;
    this.passcode = purchase.passcode;
    this.category_id = purchase.categoryId;
    this.device_id = purchase.deviceId;
    this.vehicle_id = purchase.vehicleId;
    this.is_logged_in = purchase.isLoggedIn;
    this.is_expired = purchase.isExpired;
    this.operator = purchase.operator;
    this.package_price = purchase.packagePrice;
    this.start_time = purchase.startTime;
    this.created_at = purchase.createdAt;
    this.updated_at = purchase.updatedAt;
};


Purchase.validate = (passcode, callback) => {
    let query = `SELECT purchase.id, purchase.package_id, purchase.email, purchase.is_logged_in, purchase.is_expired, categories.name AS category_name
                FROM purchase_history purchase, categories categories
                WHERE purchase.category_id = categories.id
                AND purchase.passcode = ?;`;
    sql.query(query, [passcode], (error, results) => {
        if (error) {
            console.log("Failed to fetch p.record: ", error);
            callback("Failed to fetch purchase", null);
            return;
        }

        if (results.length == 0) {
            callback(null, "");
            return;
        }

        const data = {
            purchaseHistoryId: results[0].id,
            packageId: results[0].package_id,
            isLoggedIn: results[0].is_logged_in,
            isExpired: results[0].is_expired,
            email: results[0].email,
            category: results[0].category_name
        }
        console.log("Successfully fetched p.record")
        callback(null, data);
    })
}


Purchase.updateStatus = (category, operatorId, vehicleId, email, passcode, callback) => {
    const startTime = moment().format("YYYY-MM-DD HH:mm:ss");

    let query = `UPDATE purchase_history 
                SET email = ?, device_id = ? , is_expired = '2', is_logged_in = '1', operator = ?, vehicle_id = ?, start_time = ?
                WHERE passcode = ?`;
    let values = [email, global.deviceId, operatorId, vehicleId, startTime, passcode]

    if (category == "Kiosk Sales" || category == "Credit card Sales") {
        query = `UPDATE purchase_history 
                SET is_expired = '2', device_id = ?, is_logged_in = '1', operator = ?, vehicle_id = ?, start_time = ?
                WHERE email = ? AND passcode = ?`;
        values = [global.deviceId, operatorId, vehicleId, startTime, email, passcode]
    }

    sql.query(query, values, (error, results) => {
        if (error) {
            console.log("Failed to update purchase history status: ", error);
            callback("Failed to update purchase history status", null);
            return;
        }

        console.log("Successfully updated purchase history status")
        callback(null, results);
    })
}

Purchase.logout = (purchaseId, callback) => {
    let purchaseHistoryQuery = `SELECT time_used, is_logged_in, start_time FROM purchase_history  WHERE id = ?`;
    sql.query(purchaseHistoryQuery, [purchaseId], (error, results) => {
        if (error) {
            console.log("Failed to get time used: ", error);
            callback("Failed to get time used", null);
            return;
        }

        if (results.length == 0) {
            console.log("No records found: ", error);
            callback("No records found", null);
            return;
        }

        if (results[0].is_logged_in == 0) {
            console.log("Failed to logout. User is not logged in.: ", error);
            callback("Failed to logout. User is not logged in.", null);
            return;
        }

        // Duration is in Hours format, need to convert
        const startTime = moment(results[0].start_time)

        const dateNow = moment(new Date())

        const currentTimeUsedInSeconds = dateNow.diff(startTime, 'seconds')

        const accumulatedTime = results[0].time_used + currentTimeUsedInSeconds

        let logoutQuery = `UPDATE purchase_history 
                SET is_logged_in = ?, time_used = ?
                WHERE id = ?`;
        let values = [0, accumulatedTime, purchaseId]
        sql.query(logoutQuery, values, (error, logoutResult) => {
            if (error) {
                console.log("Failed to update purchase history logout status: ", error);
                callback("Failed to update purchase history logout status", null);
                return;
            }

            console.log("Successfully updated purchase history logout status")
            callback(null, logoutResult);
        })
    })
}

Purchase.getTimeRemaining = (purchaseId, callback) => {
    let query = `SELECT hist.time_used, pkg.duration
                    FROM packages pkg, purchase_history hist
                    WHERE pkg.id = hist.package_id
                    AND hist.id = ?`;
    sql.query(query, [purchaseId], (error, results) => {
        if (error) {
            console.log("Failed to get time used: ", error);
            callback("Failed to get time used", null);
            return;
        }

        if (results.length == 0) {
            callback("No purchase history were found. Invalid id", null)
            return;
        }

        // duration is in hours, need to convert
        const durationInSeconds = results[0].duration * 60 * 60
        const availableTimeInSeconds = durationInSeconds - results[0].time_used

        const formatted = moment.utc(moment.duration(availableTimeInSeconds, 'seconds').as('milliseconds')).format('HH:mm:ss');

        callback(null, formatted)
    })
}

Purchase.create = async (newRecord, result) => {
    sql.query("INSERT INTO purchase_history SET ?", newRecord, (err, res) => {
        if (err) {
            console.log("Failed to create new record on purchase history: ", err);
            result("Failed to create new record on purchase history", null);
            return;
        }

        console.log("Successfully created data: ", { id: res.insertId, ...newRecord });
        result(null, { id: res.insertId, ...newRecord });
    });
};

module.exports = Purchase;