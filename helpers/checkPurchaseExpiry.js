const sql = require("./database");
const moment = require("moment");
const Vehicle = require('../models/Vehicle')

// PURCHASE EXPIRY CHECKER MIDDLEWARE
module.exports.checkPurchaseExpiry = (req, res, next) => {

    Vehicle.getModelType((err, modelType) => {
        if (err) {
            res.status(400).send({ error: err })
            return;
        }

        if (modelType == "free") {
            // No need to check expiration
            next();
        } else if (modelType == "paid") {
            const purchaseId = req.user.id
            console.log(req.user.id)
            let query = `SELECT hist.time_used, hist.start_time, pkg.duration, pkg.duration_in_text
                    FROM packages pkg, purchase_history hist
                    WHERE pkg.id = hist.package_id
                    AND hist.id = ?`;
            sql.query(query, [purchaseId], (error, results) => {
                if (error) {
                    console.log("Failed to get time used: ", error);
                    res.status(500).send({ error: error });
                    return;
                }

                if (results.length == 0) {
                    res.status(500).send({ error: "No purchase history were found. Invalid id" })
                    return;
                }

                // Duration is in Hours format, need to convert
                const durationInSeconds = results[0].duration * 60 * 60;
                const timeUsed = results[0].time_used;
                const availableSecondsLeft = durationInSeconds - timeUsed;

                const startTime = moment(results[0].start_time)

                const dateNow = moment(new Date())

                const currentTimeUsedInSeconds = dateNow.diff(startTime, 'seconds')

                const difference = availableSecondsLeft - currentTimeUsedInSeconds

                if (availableSecondsLeft != 0 && difference > 0) {
                    next()
                } else {
                    console.log("Package's duration has been consumed");
                    let query = `UPDATE purchase_history 
                            SET is_expired = ?, time_used = ?
                            WHERE id = ?`;
                    let values = [0, durationInSeconds, purchaseId]
                    sql.query(query, values, (error, results) => {
                        if (error) {
                            console.log("Failed to update purchase history expired status: ", error);
                            res.status(400).send({ error: error })
                            return;
                        }

                        res.status(400).send({ error: "[PACKAGE_CONSUMED] Package duration has been consumed. Please topup your MyFlix hours" })
                    })
                }
            })
        }
    });
}