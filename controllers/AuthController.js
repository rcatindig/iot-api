const jwt = require("jsonwebtoken")
const moment = require("moment");
const secretKey = process.env.SECRET_KEY

const Purchase = require("../models/Purchase")
const Vehicle = require("../models/Vehicle")
const { validateEmail } = require('../helpers/validateEmail')

// LOGIN
exports.login = (req, res) => {

    // need to add model type on the request body to identify what kind of model or what kind of authentication that are we going to use.
    // Question: Why do we need to pass the model type? we can determine the model by querying from database here.. are there other reason behind this?
    const { email, passcode, modelType } = req.body

    if (email == undefined || email == null || email.length == 0) {
        res.status(400).send({ error: "Email is required" })
        return;
    }

    if (!validateEmail(email)) {
        res.status(400).send({ error: "Invalid email address" })
        return;
    }

    if (modelType == undefined || modelType == null || modelType.length == 0) {
        res.status(400).send({ error: "Model Type is required. Please refresh the page" })
        return;
    }


    // if model type is paid the passcode is required but if its free there is no passcode
    if (modelType == "paid") {

        if (passcode == undefined || passcode == null || passcode.length == 0) {
            res.status(400).send({ error: "Passcode is required" })
            return;
        }

        // TODO PROMISIFY THESE QUERIES
        // https://stackoverflow.com/questions/54730641/node-js-how-to-apply-util-promisify-to-mysql-pool-in-its-simplest-way
        Purchase.validate(passcode, (err, result) => {
            if (err) {
                res.status(500).send({ error: err })
                return;
            }

            // Check if the purchase history / passcode is credit card and kiosk
            if (result.length == 0 ||
                ((result.category == "Kiosk Sales" || result.category == "Credit card Sales") &&
                    result.email !== email)) {
                res.status(401).send({ error: "Invalid credentials, incorrect email or passcode" })
                return;
            }

            // TODO -- ASK WHAT/WHERE ARE THE IS_EXPIRED VALUES. THIS IS CONFUSING
            // 0 - expired, 1- pending, 2 - in use ... ask if we can redo database...
            if (result.isExpired == 0) {
                res.status(403).send({ error: "Passcode has expired" })
                return;
            }

            if (result.isLoggedIn) {
                res.status(403).send({ error: "Passcode is already in use" })
                return;
            }

            const purchaseHistoryId = result.purchaseHistoryId
            const category = result.category

            Vehicle.getVehicleAndOperatorId((err, data) => {
                if (err) {
                    res.status(500).send({ error: err })
                    return;
                }

                if (data.length == 0) {
                    res.status(400).send({ error: "No vehicle and operator id found" })
                    return;
                }

                Purchase.updateStatus(category, data.operatorId, data.vehicleId, email, passcode, (err, status) => {
                    if (err) {
                        res.status(500).send({ error: err })
                        return;
                    }

                    const user = {
                        id: purchaseHistoryId,
                        email: email
                    }

                    jwt.sign(user, secretKey, { expiresIn: '12h' }, (err, token) => {
                        if (err) {
                            console.log("Failed to sign token:", err)
                            res.status(500).send({ error: "Failed to sign token" });
                            return;
                        }

                        res.send({ accessToken: token })
                    });
                })
            })
        })

    } else if (modelType == "free") { // if free model 

        // only email address is required -- added already the condition or validation on the top of the code.

        // save the email address in the purchase history.. also create unique passcode for that email. 

        // TODO: apply DRY principle, this is also being used on the if block.
        Vehicle.getVehicleAndOperatorId((err, data) => {
            if (err) {
                res.status(500).send({ error: err })
                return;
            }

            if (data.length == 0) {
                res.status(400).send({ error: "No vehicle and operator id found" })
                return;
            }

            const dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

            function generateHash(string) {
                var hash = 0;
                if (string.length == 0)
                    return hash;
                for (let i = 0; i < string.length; i++) {
                    var charCode = string.charCodeAt(i);
                    hash = ((hash << 7) - hash) + charCode;
                    hash = hash & hash;
                }
                return hash;
            }

            const passcode = "subscription_user_" + generateHash(email);

            const purchase_data = new Purchase({
                email: email,
                passcode: passcode,
                categoryId: 5,
                deviceId: global.deviceId,
                vehicleId: data.vehicleId,
                isLoggedIn: 1,
                isExpired: 1,
                operator: data.operatorId,
                packagePrice: 0,
                startTime: dateTime,
                createdAt: dateTime,
                updatedAt: dateTime,
            });

            // Save Purchase history in the database
            Purchase.create(purchase_data, (err, data) => {
                if (err) {
                    res.status(500).send({ error: err })
                    return;
                }

                const user = {
                    id: data.id,
                    email: email
                }

                // TODO: apply DRY principle, this is also being used on the if block.
                jwt.sign(user, secretKey, { expiresIn: '6h' }, (err, token) => { // change to 6h as per lucien
                    if (err) {
                        console.log("Failed to sign token:", err)
                        res.status(500).send({ error: "Failed to sign token" });
                        return;
                    }

                    res.send({ accessToken: token })
                });
            });
        })

    } else {
        console.log("Uknown model type")
        res.status(400).send({ error: "Uknown model type" })
        return;
    }
}

// LOGOUT
exports.logout = (req, res) => {

    const { purchaseId } = req.body;

    if (purchaseId == undefined || purchaseId == null || purchaseId.length == 0) {
        res.status(400).send({ error: "Time used in seconds is required" })
        return;
    }

    Purchase.logout(purchaseId, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ message: "Successfully logged out" })
    })
}