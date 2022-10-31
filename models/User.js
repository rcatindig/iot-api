'use strict';
var sql = require('../helpers/database')

var User = function (user) {
    this.user_id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.gender = user.gender;
    this.age = user.age;
    this.password = user.passcode;
    this.package_id = user.package_id;
    this.vehicle_id = user.vehicle_id;
    this.operator = user.operator;
    this.device_id = user.device_id;
    this.category_id = user.category_id;
    this.package_price = user.package_price;
    this.start_time = user.start_time;
    this.end_time = user.end_time;
    this.is_expired = user.is_expired;
}

User.login = function (email, passcode, callback) {
    // TODO: THIS MODULE WILL BE THE LAST TO BE IMPLEMENTED -- HAVING HEADACHE ON THE EXISTING LOGIN CODE FLOW
    
    // KIOSK / CARD

    // Verify if passcode is a batch passcode
    // verify weather user is logged in tell user if they passcode is already in use
    // GET THE VEHICLE AND DEVICE ID -- improve, you only need to query this once
    // update purchase_history table
    // if passcode is not logged in then make sure it is marked as logged in when user signs in
}

module.exports = User