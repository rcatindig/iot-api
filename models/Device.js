'use strict';
const sql = require('../helpers/database');
const fs = require('fs');

// Constructor
const Device = function (device) {
    this.deviceId = device.device_id;
    this.registrationNumber = device.regis_no;
    this.updatedOn = device.updated_on;
}

Device.getDeviceId = (callback) => {
    const settingsPath = './config/device_settings.json'
    fs.readFile(settingsPath, function (err, data) {
        if (err) {
            console.log("Failed to open file:", err)
            callback("Failed to open file", null)
            return;
        }

        if (data.length == 0) {
            callback(null, "")
            return
        }

        const device = new Device(JSON.parse(data).device_settings)
        callback(null, device.deviceId)
    })
}

module.exports = Device;