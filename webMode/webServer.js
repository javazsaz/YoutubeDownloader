const express = require("express");
const signale = require('signale'); //library to insert status report
const open = require("open");
const fs = require("fs");
const serverConfig = require("../config/server");
const dbConfig = require("../config/db");
const mongoose = require("mongoose");
const core = require("../assets/js/core");

var isLogged = false; // for know if user has been logged

const app = new express();

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json()) // use res.json for send response - if you use bodyParser, use res.send for send response

/**
 * load webMode folder
 */
app.use(express.static(__dirname));

/**
 * create server and open 
 */
function createServer() {
    app.listen(serverConfig.PORT, () => {
        signale.success("Server started");
        openPage();
    })
}

/**
 * open default browser. The client automatically send / request when browser will be loaded
 * for default, load index.html page
 */
async function openPage() {

    // Opens the url in the default browser
    await open(serverConfig.linkServer + serverConfig.PORT);
}

app.get("/controlLogged", (req, res)    =>  {

    res.json({isLogged: isLogged, offlineMode: dbConfig.offlineMode})
});

/**
 * when receive / request, load index.html file and send it at client
 */
app.post("/login", (req, res) => {

    dbConfig.username = req.body.username;
    dbConfig.password = req.body.password;
    dbConfig.MongoUri = "mongodb+srv://" + dbConfig.username + ":" + dbConfig.password + "@cluster-youtubedownload.v9azt.mongodb.net/youtubeDownloadDB?retryWrites=true&w=majority"

    signale.pending("Connecting to database...")

    //Connect to Mongo
    mongoose.connect(dbConfig.MongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
        signale.success("Database connected!");

        // save the last access
        await core.createLogAccess(dbConfig.username);

        //control and create/update logs.txt file
        await core.controlLogAccess();

        //save that user has been logged
        isLogged = true;
        dbConfig.offlineMode = false;
         
        res.json({msg: "Logged"})

    }).catch((err) => {
        signale.error("Authentication failed! " + err.codeName + " - Error code: " + err.code);
        res.json({err: err})
    })
    
});

/**
 * Request for OfflineMode
 */
app.post("/offlineMode", (req, res)  => {

    //Set Login parameter for access to application
    isLogged = true;

    //Set offlineMode parameter
    dbConfig.offlineMode = true;

    res.json({msg: "Offline Mode activated"})
})

/**
 * Request for logout
 */
 app.get("/logout", async (req, res)  =>  {

    isLogged = false;
    res.json({msg: "Good bye! Comes back soon"})
})

/**
 * when receive /downloadMedia request
 */
app.post("/downloadMedia", (req, res) => {
    const mode = req.body.mode;
    const link = req.body.link;

    try {
        if (mode === "video") {
            core.downloadVideo(link, false, (response) => {
                if (!dbConfig.offlineMode) {
                    core.saveMediaOnDb(mode, response.fileName, link);// save link on db
                }
                res.json(response);
            })

        } else if (mode === "audio") {
            core.downloadAudio(link, false, (response) => {
                if (!dbConfig.offlineMode) {
                    core.saveMediaOnDb(mode, response.fileName, link); // save link on db
                }
                res.json(response);
            })
        }
    } catch (err) {
        res.json({ error: err });
    }
});

/**
 * Request for get logs
 */
app.get("/getLogs", async (req, res)  =>  {

    if (!dbConfig.offlineMode) {
        let logs = await core.readLogsFile();
        res.json(logs);
    } else  {
        res.json();
    }
})

/**
 * Request for receive app version
 */
app.get("/getVersion", function(req, res)   {

    try {
        res.json(core.getVersion());

    } catch (error) {
        res.json({ error: error });  
    }
})

module.exports = createServer;