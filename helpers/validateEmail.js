'use strict';
// https://github.com/manishsaraan/email-validator
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

// EMAIL VALIDATOR
module.exports.validateEmail = (email) => {
    if (!email) return false;

    if (email.length > 256) return false;

    if (!emailRegex.test(email)) return false;

    // Further checking of some things regex can't handle
    const [account, address] = email.split('@');
    if (account.length > 64) return false;

    const domainParts = address.split('.');
    if (domainParts.some((part) => {
        return part.length > 63;
    })) return false;

    return true;
}