const validator = require("validator");

const sanitizeString = (value) => {
    if (typeof value !== "string") {
        return "";
    }
    return validator.escape(value.trim());
};

const sanitizeEmail = (email) => {
    if (typeof email !== "string") {
        return "";
    }
    return email.trim().toLowerCase();
};

module.exports = {
    sanitizeEmail,
    sanitizeString
};