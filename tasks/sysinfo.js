
const si = require('systeminformation');
const moment = require('moment');
const speedTest = require('speedtest-net');



const SIMemoryTemperatures = require("../models/SIMemoryTemperatures.js");
const SINetworkInfo = require("../models/SINetworkInfo.js");
const Vehicle = require("../models/Vehicle.js");


module.exports = {
    getMemoryTemperature: async function () {

        const memory = await si.mem(); // use for memory

        const cpuTemp = await si.cpuTemperature(); // use for memory temperature4

        Vehicle.getDeviceId(function (err, rows) { // get the device id
            
            if (err) {
                console.log("Failed to get device ID")
                console.error(err);
            } else {    
                const vehicleId = rows[0].id;

                var dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

                const data = new SIMemoryTemperatures({
                    vehicle_id: vehicleId,
                    date_time: dateTime,
                    mem_total: memory.total,
                    mem_free: memory.free,
                    mem_used: memory.used,
                    mem_active: memory.active,
                    cpu_temp: cpuTemp.main
                });

                // Save SIMemoryTemperatures in the database
                SIMemoryTemperatures.create(data, (err, data) => { // save memory and temperatures
                    if (err) {
                        console.log("Failed to create SIMemoryTemperatures")
                        console.error(err)
                    } else {
                        console.log(data);
                    }
                });
            }
        });
    },

    getNetworkInfo: async function () {

        try {
            const networkStats = await si.networkStats();

            const networkInterfaces = await si.networkInterfaces();

            // const speedTestResult = await speedTest({acceptLicense: true,
            //                                         acceptGdpr: true
            //                                         });

            

            // const downloadSpeed = speedTestResult.download;
            // const uploadSpeed = speedTestResult.upload;
            
            

            // const downloadSpeedBytes = downloadSpeed.bytes;
            // const uploadSpeedBytes = uploadSpeed.bytes;

            const downloadSpeedBytes = 0;
            const uploadSpeedBytes = 0;

            Vehicle.getDeviceId(function (err, rows) { // get the device id
                
                if (err) {
                    console.log("Failed to get device ID")
                    console.error(err);
                } else {
                    const vehicleId = rows[0].id;

                    var dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

                    const data = new SINetworkInfo({
                        vehicle_id: vehicleId,
                        date_time: dateTime,
                        received_bytes: networkStats[0].rx_sec,
                        transferred_bytes: networkStats[0].tx_sec,
                        speed: networkInterfaces[0].speed,
                        download: downloadSpeedBytes,
                        upload: uploadSpeedBytes
                    });

                    // Save SINetworkInfo in the database
                    SINetworkInfo.create(data, (err, data) => { // save memory and temperatures
                        if (err) {
                            console.log("Failed to create SINetworkInfo")
                            console.error(err)
                        } else {
                            console.log(data)
                        }
                    });
                }
            });

        } catch (e) {
            console.log(e)
        }
    },
};