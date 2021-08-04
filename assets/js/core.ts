const youtubedl: any = require('ytdl-core'); //library for download youtube videos
const YoutubeMp3DownloaderModule: any = require("youtube-mp3-downloader"); // get module for download audio
const signale: any = require('signale'); //library to insert status report
const inquirer: any = require('inquirer'); //library for use interavtive commands
const fs: any = require("fs");
const logAccessModel: any = require("../../models/logAccess");
const mediaModel: any = require("../../models/media");
const os: any = require("os");
const hostname: any = os.hostname();
const publicIp: any = require("public-ip");

/**
 * Show list modes : video or audio ( for cli mode )
 */
function selectMode():void {

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
    ]).then(function (answer: any) {
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
function startAudio():void {

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "What is the audio link? Ctrl+c to exit" // question
        }
    ])
        .then(answer => { // answer contain link property ( name property of question )

            downloadAudio(answer.link, true, {});
        })
}


/**
 * For start the download video
 */
function startVideo():void {

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

                downloadVideo(answers.link, true, {});

            } else {
                signale.info("Please insert the link video for download it! ")
                startVideo()
            }

        })
}

/**
 * Control if the logs on mongodb exist and create logs.txt file
 */
function controlLogAccess():Promise<void>  {
    return new Promise(async (resolve) => {

        //validation passed
        logAccessModel.find({}, function (err: string, logs: any) {
            let logsData = "";

            // Execute the each command, triggers for each document
            logs.forEach(function (log) {

                var h: string = log.date.getHours();
                var m: string = log.date.getMinutes();
                var s: string = log.date.getSeconds();
                var dd: string = log.date.getDate();
                var mm: string = log.date.getMonth() + 1;
                var yyyy: string = log.date.getFullYear();
                logsData += "<p>Name: " + log.name + " - " + "Username: " + log.username + " - " +
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
 * @param username -> Username logged
 * @returns 
 */
function createLogAccess(username: string): Promise<void> {
    return new Promise(async (resolve) => {

        const localIpAdress: string = getLocalIp();
        const publicIpAdress: string = await publicIp.v4();

        const newLogAccess: any = new logAccessModel({ // create new document with model for mongodb
            name: hostname,
            username: username,
            date: Date.now(),
            localIP: localIpAdress,
            publicIP: publicIpAdress
        });

        await newLogAccess.save();
        resolve()
    })
}

/**
 * Insert link of media on mongodb
 * @param mode -> mode selected - audio or video
 * @param fileName -> Name of the file
 * @param link -> Link of media
 * @returns 
 */
 function saveMediaOnDb(mode: string, fileName: string, link: string): Promise<void> {
    return new Promise(async (resolve) => {

        const newMedia: any = new mediaModel({ // create new document with model for mongodb
            fileName: fileName,
            mode: mode,
            link: link,
            date: Date.now(),
        });

        await newMedia.save();
        resolve()
    })
}

/**
 * Get local ip adress
 */
function getLocalIp(): string {

    let localAddress: string,
        ifaces: any = os.networkInterfaces();
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
function downloadVideo(link: string, cliMode: boolean, callback: any) {

    const id: string = getIdFromLink(link);

    youtubedl.getInfo(id).then(info => {

        const videoTitle: string = info.videoDetails.title;

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
function downloadAudio(link: string, cliMode: boolean, callback: any) {

    link = getIdFromLink(link);

    new Promise(function (resolve, reject) {

        //Configure YoutubeMp3Downloader with your settings
        var YD = new YoutubeMp3DownloaderModule({
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
function readLogsFile(): Promise<any> {
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
function getIdFromLink(link: string): string  {
    
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

/**
 * Get current version from package.json file
 * @returns version -> string
 */
function getVersion(): string  {

    var pjson = require("../../package.json");
    return(pjson.version);
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
    readLogsFile: readLogsFile,
    getVersion: getVersion,
    saveMediaOnDb: saveMediaOnDb
}