const mongoose = require("mongoose");

//create log schema
const logAccessSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    name:   {
        type: String
    },
    username:   {
        type: String
    },
    localIP: {
        type: String
    },
    publicIP:   {
        type: String
    }
})

const logAccess = mongoose.model("logAccess", logAccessSchema);

module.exports = logAccess;