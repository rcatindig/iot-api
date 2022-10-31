const Agreement = require('../models/Agreement')
const Advertisement = require('../models/Advertisement')
const Device = require('../models/Device')
const Vehicle = require('../models/Vehicle')
const Purchase = require('../models/Purchase')

// ADVERTISEMENT
exports.advertisements = (req, res) => {
    Advertisement.findAll((err, data) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { advertisements: data } })
    })
}

// AGREEMENT
exports.userAgreement = (req, res) => {
    Agreement.getAgreement((err, data) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { content: data } })
    })
}

// DEVICE ID
exports.deviceId = (req, res) => {
    Device.getDeviceId((err, data) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { id: data } })
    })
}

// MODEL TYPE
exports.modelType = (req, res) => {
    Vehicle.getModelType((err, data) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { modelType: data } })
    })
}

exports.getTimeRemaining = (req, res) => {
    const purchaseId = req.user.id
    Purchase.getTimeRemaining(purchaseId, (err, data) => {
        if (err) {
            res.status(500).send({ error: err })
            return;
        }

        res.send({ data: { timeRemaining: data } })
    })
}