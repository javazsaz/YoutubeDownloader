const express = require("express");
const signale = require('signale'); //library to insert status report
const open = require("open");
const fs = require("fs");
const serverConfig = require("../config/server");
const core = require("../assets/js/core");

const app = new express();

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json()) // use res.json for send response - if you use bodyParser, use res.send for send response

//load webMode folder
app.use(express.static(__dirname));

//create server and open 
function createServer() {
    app.listen(serverConfig.PORT, () => {
        signale.success("Server started");
        openPage();
    })
}

//open default browser. The client automatically send / request when browser will be loaded
async function openPage() {

    // Opens the url in the default browser
    await open(serverConfig.linkServer + serverConfig.PORT);
}

//when receive / request, load index.html file and send it at client
app.get("/", (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('index.html').pipe(res)
});

//when receive /downloadMedia request
app.post("/downloadMedia", (req, res) => {

    const mode = req.body.mode;
    const link = req.body.link;
    const subtitles = req.body.subtitles;

    try {
        if (mode === "video") {
            core.downloadVideo(link, subtitles, false, (response) => {
                res.json({ success: response, status: 200 });
            })

        } else if (mode === "audio") {
            core.downloadAudio(link, false, (response) => {
                res.json(response);
            })
        }
    } catch (err) {
        res.json({ error: err });
    }
})

module.exports = createServer;