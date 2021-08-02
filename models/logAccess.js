var mongooseDriver = require("mongoose");
//create log schema
var logAccessSchema = new mongooseDriver.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    name: {
        type: String
    },
    username: {
        type: String
    },
    localIP: {
        type: String
    },
    publicIP: {
        type: String
    }
});
var logAccess = mongooseDriver.model("logAccess", logAccessSchema);
module.exports = logAccess;
//# sourceMappingURL=logAccess.js.map