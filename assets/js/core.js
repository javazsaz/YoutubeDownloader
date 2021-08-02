var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var youtubedl = require('ytdl-core'); //library for download youtube videos
var YoutubeMp3DownloaderModule = require("youtube-mp3-downloader"); // get module for download audio
var signale = require('signale'); //library to insert status report
var inquirer = require('inquirer'); //library for use interavtive commands
var fs = require("fs");
var logAccessModel = require("../../models/logAccess");
var mediaModel = require("../../models/media");
var os = require("os");
var hostname = os.hostname();
var publicIp = require("public-ip");
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
        }
        else if (answer.mode == "audio") { // if answer is audio ( value of choices )
            startAudio();
        }
    });
}
/**
 * For start the download audio
 */
function startAudio() {
    inquirer.prompt([
        {
            // parameters
            type: "question",
            name: "link",
            message: "What is the audio link? Ctrl+c to exit" // question
        }
    ])
        .then(function (answer) {
        downloadAudio(answer.link, true, {});
    });
}
/**
 * For start the download video
 */
function startVideo() {
    inquirer.prompt([
        {
            // parameters
            type: "question",
            name: "link",
            message: "What is the video link? Ctrl+c to exit" // question
        }
    ])
        .then(function (answers) {
        if (answers.link) {
            downloadVideo(answers.link, true, {});
        }
        else {
            signale.info("Please insert the link video for download it! ");
            startVideo();
        }
    });
}
/**
 * Control if the logs on mongodb exist and create logs.txt file
 */
function controlLogAccess() {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //validation passed
            logAccessModel.find({}, function (err, logs) {
                var logsData = "";
                // Execute the each command, triggers for each document
                logs.forEach(function (log) {
                    var h = log.date.getHours();
                    var m = log.date.getMinutes();
                    var s = log.date.getSeconds();
                    var dd = log.date.getDate();
                    var mm = log.date.getMonth() + 1;
                    var yyyy = log.date.getFullYear();
                    logsData += "<p>Name: " + log.name + " - " + "Username: " + log.username + " - " +
                        "Date: " + h + ":" + m + ":" + s + ", " + dd + "/" + mm + "/" + yyyy + " - " +
                        "Local IP: " + log.localIP + " - " +
                        "Public IP: " + log.publicIP + "<br>" +
                        "----------------</p>";
                });
                fs.writeFile('logs.html', logsData, function (err) {
                    if (err)
                        throw err;
                    signale.success('Logs saved!');
                    resolve();
                });
            });
            return [2 /*return*/];
        });
    }); });
}
/**
 * Insert new log on mongodb
 * @param username -> Username logged
 * @returns
 */
function createLogAccess(username) {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var localIpAdress, publicIpAdress, newLogAccess;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localIpAdress = getLocalIp();
                    return [4 /*yield*/, publicIp.v4()];
                case 1:
                    publicIpAdress = _a.sent();
                    newLogAccess = new logAccessModel({
                        name: hostname,
                        username: username,
                        date: Date.now(),
                        localIP: localIpAdress,
                        publicIP: publicIpAdress
                    });
                    return [4 /*yield*/, newLogAccess.save()];
                case 2:
                    _a.sent();
                    resolve();
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * Insert link of media on mongodb
 * @param mode -> mode selected - audio or video
 * @param fileName -> Name of the file
 * @param link -> Link of media
 * @returns
 */
function saveMediaOnDb(mode, fileName, link) {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        var newMedia;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newMedia = new mediaModel({
                        fileName: fileName,
                        mode: mode,
                        link: link,
                        date: Date.now(),
                    });
                    return [4 /*yield*/, newMedia.save()];
                case 1:
                    _a.sent();
                    resolve();
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * Get local ip adress
 */
function getLocalIp() {
    var localAddress, ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        ifaces[dev].filter(function (details) { return details.family === 'IPv4' && details.internal === false ? localAddress = details.address : undefined; });
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
    var id = getIdFromLink(link);
    youtubedl.getInfo(id).then(function (info) {
        var videoTitle = info.videoDetails.title;
        youtubedl(link)
            .pipe(fs.createWriteStream(process.cwd() + "/video/" + videoTitle + ".mp4")).on("finish", function () {
            //Message on terminal
            signale.success("The video: " + videoTitle + " has been downloaded");
            if (cliMode) {
                //Restart application while user send Ctrl+c command
                selectMode();
            }
            else {
                callback({ fileName: videoTitle, message: "Video: " + videoTitle + " has been downloaded" });
            }
        });
    });
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
        var YD = new YoutubeMp3DownloaderModule({
            //"ffmpegPath": process.cwd() + "/lib/ffmpeg",         // FFmpeg binary location
            "outputPath": process.cwd() + "/audio",
            "youtubeVideoQuality": "highestaudio",
            "queueParallelism": 2,
            "progressTimeout": 2000,
            "allowWebm": false // Enable download from WebM sources (default: false)
        });
        signale.pending("Start to download audio track...");
        //Download video and save as MP3 file
        YD.download(link);
        //when download is finished
        YD.on("finished", function (err, data) {
            signale.success("Audio track downloaded");
            //trasform bytes on MB
            var transferredData = data.stats.transferredBytes / 1000000;
            signale.info('Name of audio track: ' + data.videoTitle);
            signale.info('Size: ' + transferredData.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + " MB");
            if (cliMode) {
                //ask new question: audio or video
                selectMode();
            }
            else {
                callback({ fileName: data.videoTitle, message: "Audio: " + data.videoTitle + " has been downloaded" });
            }
        });
        //if download obtain an error
        YD.on("error", function (err) {
            if (cliMode) {
                //ask new question: audio or video
                console.log(err);
            }
            else {
                callback({ error: err });
            }
        });
        //during download
        YD.on("progress", function (progress) {
            //show percentage
            var percentage = progress.progress.percentage;
            signale.info(percentage.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + "%");
        });
    });
}
/**
 * Read logs file
 */
function readLogsFile() {
    var _this = this;
    return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!fs.existsSync("logs.html")) {
                return [2 /*return*/, ({ error: "No logs available" })];
            }
            else {
                fs.readFile('logs.html', 'utf-8', function (err, data) {
                    if (err) {
                        resolve({ error: err });
                    }
                    resolve({ success: data });
                });
            }
            return [2 /*return*/];
        });
    }); });
}
/**
 * Get id from link
 * @param {*} link -> URL to video
 * @returns -> id
 */
function getIdFromLink(link) {
    //complex format
    if (link.indexOf("&") != -1) {
        //get only id of link - you can download audio to get id
        link = link.substring(link.indexOf("v=") + 2, link.indexOf("&"));
        //simple format
    }
    else {
        //get only id of link - you can download audio to get id
        link = link.substring(link.indexOf("v=") + 2, link.length);
    }
    return link;
}
/**
 * Get current version from package.json file
 * @returns version -> string
 */
function getVersion() {
    var pjson = require("../../package.json");
    return (pjson.version);
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
};
//# sourceMappingURL=core.js.map