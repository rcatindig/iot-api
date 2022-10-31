const sql = require("../helpers/database");

// constructor
const SINetworkInfo = function (data) {
  this.vehicle_id = data.vehicle_id;
  this.date_time = data.date_time;
  this.received_bytes = data.received_bytes;
  this.transferred_bytes = data.transferred_bytes;
  this.speed = data.speed;
  this.download = data.download;
  this.upload = data.upload;
};

SINetworkInfo.create = async (newRecord, result) => {
  sql.query("INSERT INTO si_network_infos SET ?", newRecord, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created data: ", { id: res.insertId, ...newRecord });
    result(null, { id: res.insertId, ...newRecord });
  });
};


module.exports = SINetworkInfo;