var inquirer = require('inquirer'); //library for use interavtive commands
var youtubedl = require('youtube-dl'); //library for download youtube videos
var signale = require('signale'); //library to insert status report
var asciify = require('asciify-image'); //library for create asciify images

var fs = require("fs");

showLogo();

/**
 * Show  or not application logo and start application
 */
function showLogo() {

        var optionsAsciify = {
            fit: 'box',
            width: 15,
            height: 15
        };
        asciify('./images/image.png', optionsAsciify, function (err, asciified) {
            if (err) throw err;

            // Print to console
            console.log(asciified);

            selectMode();
        })
}

function selectMode()   {
     
    // ask mode
     inquirer.prompt([
        {
            type: 'list',
            message: 'Seleziona la modalità che vorresti usare: Ctrl+c per uscire',
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
        if(answer.mode == "video")    {
            startVideo();
        } else if(answer.mode == "audio") {
            startAudio();
        }
    })
}

function startAudio() {
    var YoutubeMp3Downloader = require("youtube-mp3-downloader");

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "Qual'è l'id del video da cui scaricare l'audio? Ctrl+c per uscire" // question
        }
    ])
        .then(answer => {

            //Configure YoutubeMp3Downloader with your settings
            var YD = new YoutubeMp3Downloader({
               "ffmpegPath": process.cwd() + "/lib/ffmpeg",         // FFmpeg binary location
               "outputPath": process.cwd() + "/audio",  // Output file location (default: the home directory)
                "youtubeVideoQuality": "highestaudio",  // Desired video quality (default: highestaudio)
                "queueParallelism": 2,                  // Download parallelism (default: 1)
                "progressTimeout": 2000,                // Interval in ms for the progress reports (default: 1000)
                "allowWebm": false                      // Enable download from WebM sources (default: false)
            });
            
            signale.pending("Inizio a scaricare la traccia audio...")
            
            //Download video and save as MP3 file
            YD.download(answer.link);


            YD.on("finished", function (err, data) {
                signale.success("Traccia audio scaricata");
                
                var transferredData = data.stats.transferredBytes / 1000000;
                signale.info('Nome della traccia audio: ' + data.videoTitle)
                signale.info('Dimensioni: ' + transferredData.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + " MB")

                selectMode();
            });

            YD.on("error", function (error) {
                console.log(error);
            });

            YD.on("progress", function (progress) {

                var percentage = progress.progress.percentage;
                signale.info(percentage.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0] + "%");
            });
        })
}


/**
 * Start application
 */
function startVideo() {

    inquirer.prompt([
        {
            // parameters
            type: "question", // type
            name: "link", //response name
            message: "Qual'è il link del video da scaricare? Ctrl+c per uscire" // question
        },
        {
            type: "question",
            name: "subtitles",
            message: "Vuoi i sottotitoli? (S/N)"
        }
    ])
        .then(answers => {
            
            const video = youtubedl(answers.link,
                // Optional arguments passed to youtube-dl.
                ['--format=18'],
                // Additional options can be given for calling `child_process.execFile()`.
                { cwd: process.cwd() + "/video" }

            )

            // Will be called when the download starts.
            video.on('info', function (info) {
                var size = info.size / 1000000;
                size = size.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
                signale.info('Nome del video: ' + info._filename)
                signale.info('Dimensioni: ' + size + " MB")
                signale.pending('Inizio a scaricare il video');
                
                //download video
                video.pipe(fs.createWriteStream(info._filename + '.mp4'))
            });

            //When downloading is finished
            video.on('end', function () {
                signale.success("Il video è stato scaricato");

                //if you want subtitles
                if (answers.subtitles.toUpperCase() === "S") {
                    signale.pending("Inizio a scaricare i sottotitoli");

                    const options = {
                        // Write automatic subtitle file (youtube only)
                        auto: false,
                        // Downloads all the available subtitles.
                        all: false,
                        // Subtitle format. YouTube generated subtitles
                        // are available ttml or vtt.
                        format: 'ttml',
                        // Languages of subtitles to download, separated by commas.
                        lang: 'it, en',
                        // The directory to save the downloaded files in.
                        cwd: process.cwd() + "/Subtitles",
                    }

                    youtubedl.getSubs(answers.link, options, function (err, files) {
                        if (err) throw err

                        //if thesubtitles are presents
                        if (files.length > 0) {
                            signale.success('I sottotitoli sono stati scaricati:', files);
                        } else {
                            signale.fatal("I sottotitoli non sono disponibili");
                        }

                        //Restart application while user send Ctrl+c command
                        selectMode();
                    })
                } else  {

                    //Restart application while user send Ctrl+c command
                    selectMode();
                }
            })

        })
}