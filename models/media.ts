const mongoose = require("mongoose");

//create log schema
const mediaSchema = new mongoose.Schema({
    fileName:   {
        type: String
    },
    mode:   {
        type: String
    },
    link:   {
        type: String
    },
    date: {
        type: Date
    }
})

const media = mongoose.model("media", mediaSchema);

module.exports = media;