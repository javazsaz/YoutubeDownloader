const mongooseDriver = require("mongoose");

//create log schema
const logAccessSchema = new mongooseDriver.Schema({
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

const logAccess = mongooseDriver.model("logAccess", logAccessSchema);

module.exports = logAccess;