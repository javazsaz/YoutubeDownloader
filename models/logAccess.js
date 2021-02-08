const mongoose = require("mongoose");
const os = require("os");
const hostname = os.hostname();

const logAccessSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    name:   {
        type: String,
        default: hostname
    }
})

const logAccess = mongoose.model("logAccess", logAccessSchema);

module.exports = logAccess;