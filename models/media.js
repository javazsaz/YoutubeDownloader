var mongoose = require("mongoose");
//create log schema
var mediaSchema = new mongoose.Schema({
    fileName: {
        type: String
    },
    mode: {
        type: String
    },
    link: {
        type: String
    },
    date: {
        type: Date
    }
});
var media = mongoose.model("media", mediaSchema);
module.exports = media;
//# sourceMappingURL=media.js.map