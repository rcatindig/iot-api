const sql = require("../helpers/database");

// constructor
const SIMemoryTemperatures = function (data) {
  this.vehicle_id = data.vehicle_id;
  this.date_time = data.date_time;
  this.mem_total = data.mem_total;
  this.mem_free = data.mem_free;
  this.mem_used = data.mem_used;
  this.mem_active = data.mem_active;
  this.cpu_temp = data.cpu_temp;
};

SIMemoryTemperatures.create = async (newRecord, result) => {
  sql.query("INSERT INTO si_memory_temperatures SET ?", newRecord, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created data: ", { id: res.insertId, ...newRecord });
    result(null, { id: res.insertId, ...newRecord });
  });
};


module.exports = SIMemoryTemperatures;