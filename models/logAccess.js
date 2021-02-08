const mongoose = require("mongoose");
const os = require("os");
const hostname = os.hostname();

//create log schema
const logAccessSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    name:   {
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