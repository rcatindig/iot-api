const sql = require("../helpers/database");
const fs = require('fs');

// Constructor
const Vehicle = function (vehicle) {
    this.id = vehicle.vehicle_id;
    this.operatorId = vehicle.operator_id;
    this.vehicleNumber = vehicle.vehicle_no;
    this.registrationNumber = vehicle.regis_no;
    this.deviceId = vehicle.device_id;
    this.simcardNumber = vehicle.sim_card_no;
    this.threshold = vehicle.threshold;
    this.remarks = vehicle.remarks;
    this.modelType = vehicle.model_type;
    this.status = vehicle.status;
};


Vehicle.getDeviceId = (callback) => {
    console.log("Hello");

    // TODO -- TRY IF DEVICE.JS CAN BE USED TO GET THE DEVICE ID HERE
    var json = fs.readFileSync('./device_settings.json');
    let device = JSON.parse(json);
    let device_id = device.device_settings.device_id;

    var query = "SELECT * FROM vehicles WHERE device_id = '" + device_id + "'";
    return sql.query(query, callback);
};


Vehicle.getOperatorId = (callback) => {
    let query = "SELECT operator_id FROM vehicles WHERE device_id = ?"
    sql.query(query, [global.deviceId], (error, results) => {
        if (error) {
            console.log("Failed to get operator ID: ", error);
            callback("Failed to get operator ID", null);
            return;
        }

        if (results.length == 0) {
            callback(null, "");
            return;
        }

        console.log("Successfully fetched operator id")
        const operatorId = results[0].operator_id
        callback(null, operatorId);
    })
}

Vehicle.getModelType = (callback) => {
    let query = "SELECT model_type FROM vehicles WHERE device_id = ?"
    sql.query(query, [global.deviceId], (error, results) => {
        if (error) {
            console.log("Failed to get model type: ", error);
            callback("Failed to get model type", null);
            return;
        }

        if (results.length == 0) {
            callback(null, "");
            return;
        }

        console.log("Successfully fetched model type")
        const modelType = results[0].model_type
        callback(null, modelType);
    })
}

Vehicle.getVehicleAndOperatorId = (callback) => {
    let query = "SELECT id, operator_id FROM vehicles WHERE device_id = ?"
    sql.query(query, [global.deviceId], (error, results) => {
        if (error) {
            console.log("Failed to get vehicle and operator id: ", error);
            callback("Failed to get vehicle and operator id", null);
            return;
        }

        if (results.length == 0) {
            callback(null, "");
            return;
        }

        console.log("Successfully fetched vehicle and operator id")
        const ids = {
            vehicleId: results[0].id,
            operatorId: results[0].operator_id
        }
        callback(null, ids);
    })
}

module.exports = Vehicle;