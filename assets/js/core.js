const youtubedl = require('ytdl-core'); //library for download youtube videos
const YoutubeMp3Downloader = require("youtube-mp3-downloader"); // get module for download audio
const signale = require('signale'); //library to insert status report
const inquirer = require('inquirer'); //library for use interavtive commands
const fs = require("fs");
const logAccessSchema = require("../../models/logAccess");
const os = require("os");
const hostname = os.hostname();
const publicIp = require("public-ip");

let nameVideo = "";

/**
 * Show list modes : video or audio
 */
function selectMode() {

    // ask mode
    inquirer.prompt([
        {
            type: 'list',
            message: 'Choose the mode to use. Ctrl+C to exit',
            name: 'mode',
            default: 'video',
            choices: [
                {
                    name: "Download video",
                    value: "video",
                },
                {
                    name: "Download audio",
                    value: "audio",
                }
            ]
        }
    ]).then(function (answer) {
        if (answer.mode == "video") { // if answer is video ( value of choices )
            startVideo();
        } else if (answer.mode == "audio") { // if answer is audio ( value of choices )
            startAudio();
        }
    })
}

/**
 * For start the download audio
 */
function startAudio() {

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "What is the audio link? Ctrl+c to exit" // question
        }
    ])
        .then(answer => { // answer contain link property ( name property of question )

            downloadAudio(answer.link, true);
        })
}


/**
 * For start the download video
 */
function startVideo() {

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "What is the video link? Ctrl+c to exit" // question
        }
    ])
        .then(answers => { // answer contain link and subtitles properties ( name of questions )

            if (answers.link) {

                downloadVideo(answers.link, true);

            } else {
                signale.info("Please insert the link video for download it! ")
                startVideo()
            }

        })
}

/**
 * Control if the logs on mongodb exist and create logs.txt file
 */
function controlLogAccess() {
    return new Promise(async (resolve) => {

        //validation passed
        logAccessSchema.find({}, function (err, logs) {
            let logsData = "";

            // Execute the each command, triggers for each document
            logs.forEach(function (log) {

                var h = log.date.getHours();
                var m = log.date.getMinutes();
                var s = log.date.getSeconds();
                var dd = log.date.getDate();
                var mm = log.date.getMonth() + 1;
                var yyyy = log.date.getFullYear();
                logsData += "<p>Name: " + log.name + " - " +
                    "Date: " + h + ":" + m + ":" + s + ", " + dd + "/" + mm + "/" + yyyy + " - " +
                    "Local IP: " + log.localIP + " - " +
                    "Public IP: " + log.publicIP + "<br>" + 
                    "----------------</p>";
            });

            fs.writeFile('logs.html', logsData, function (err) {
                if (err) throw err;
                signale.success('Logs saved!');
                resolve();
            });
        })
    })
}

/**
 * Insert new log on mongodb
 */
function createLogAccess() {
    return new Promise(async (resolve) => {

        const localIpAdress = getLocalIp();
        const publicIpAdress = await publicIp.v4();

        const newLogAccess = new logAccessSchema({ // create new model obj for mongodb
            name: hostname,
            date: Date.now(),
            localIP: localIpAdress,
            publicIP: publicIpAdress
        });

        await newLogAccess.save();
        resolve()
    })
}

/**
 * Get local ip adress
 */
function getLocalIp() {

    var localAddress,
        ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? localAddress = details.address : undefined);
    }
    return localAddress;

}

/**
 * Download video
 * @param link -> link to download
 * @param cliMode -> if request arrived from CLI mode or not: true or false
 * @param callback -> used for web mode
 */
function downloadVideo(link, cliMode, callback) {

    const id = getIdFromLink(link);

    youtubedl.getInfo(id).then(info => {

        const videoTitle = info.videoDetails.title;

        youtubedl(link)
            .pipe(fs.createWriteStream(process.cwd() + "/video/" + videoTitle + ".mp4")).on("finish", function () {

                //Message on terminal
                signale.success("The video: " + videoTitle + " has been downloaded");

                if (cliMode) {
                    //Restart application while user send Ctrl+c command
                    selectMode();
                } else {
                    callback({ fileName: videoTitle, message: "Video: " + videoTitle + " has been downloaded" });
                }
            });
    })
}

/**
 * Download audio
 * @param {*} link -> link to download
 * @param {*} cliMode -> if request arrived from CLI mode or not: true or false
 * @param {*} callback -> used from web mode
 */
function downloadAudio(link, cliMode, callback) {

    link = getIdFromLink(link);

    new Promise(function (resolve, reject) {

        //Configure YoutubeMp3Downloader with your settings
        var YD = new YoutubeMp3Downloader({
            //"ffmpegPath": process.cwd() + "/lib/ffmpeg",         // FFmpeg binary location
            "outputPath": process.cwd() + "/audio",  // Output file location (default: the home directory)
            "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
            "queueParallelism": 2,                  // Download parallelism (default: 1)
            "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
            "allowWebm": false                      // Enable download from WebM sources (default: false)
        });

        signale.pending("Start to download audio track...")

        //Download video and save as MP3 file
        YD.download(link);


        //when download is finished
        YD.on("finished", function (err, data) {
            signale.success("Audio track downloaded");

            //trasform bytes on MB
            var transferredData = data.stats.transferredBytes / 1000000;
            signale.info('Name of audio track: ' + data.videoTitle)
            signale.info('Size: ' + transferredData.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + " MB")

            if (cliMode) {
                //ask new question: audio or video
                selectMode();
            } else {
                callback({fileName: data.videoTitle, message:"Audio: " + data.videoTitle + " has been downloaded"});
            }
        });

        //if download obtain an error
        YD.on("error", function (err) {
            if (cliMode) {
                //ask new question: audio or video
                console.log(err);
            } else {
                callback({error: err});
            }
            
        });

        //during download
        YD.on("progress", function (progress) {

            //show percentage
            var percentage = progress.progress.percentage;
            signale.info(percentage.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + "%");
        });
    })
}

/**
 * Read logs file
 */
function readLogsFile() {
    return new Promise(async (resolve) => {
        if (!fs.existsSync("logs.html")) {
            return ({ error: "No logs available" });
        } else {
            fs.readFile('logs.html', 'utf-8', function (err, data) {
                if (err) {
                    resolve({ error: err });
                }
                resolve({ success: data });
            });
        }
    })
}

/**
 * Get id from link
 * @param {*} link -> URL to video
 * @returns -> id
 */
function getIdFromLink(link)    {
    
    //complex format
    if (link.indexOf("&") != -1) {

        //get only id of link - you can download audio to get id
        link = link.substring(link.indexOf("v=") + 2, link.indexOf("&"))

        //simple format
    } else {
        //get only id of link - you can download audio to get id
        link = link.substring(link.indexOf("v=") + 2, link.length)
    }

    return link;
}

//export module 
// a module object that contain key -> value: propertyName: call functionName
module.exports = {
    selectMode: selectMode,
    startAudio: startAudio,
    startVideo: startVideo,
    controlLogAccess: controlLogAccess,
    createLogAccess: createLogAccess,
    getLocalIp: getLocalIp,
    downloadVideo: downloadVideo,
    downloadAudio: downloadAudio,
    readLogsFile: readLogsFile
}