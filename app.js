const signale = require('signale'); //library to insert status report
const inquirer = require('inquirer'); //library for use interavtive commands
const asciify = require('asciify-image'); //library for create asciify images
const mongoose = require("mongoose");
const dbConfig = require("./config/db"); // For obtain all options to connect on MongoDB
const createServer = require("./webMode/webServer");
const core = require("./assets/js/core");

showLogo();

/**
 * Connect to MongoDB
 */
function connectDb() {
    return new Promise(async (resolve) => {

        //Ask username and password for MongoDB
        inquirer.prompt([
            {
                // parameters
                type: "input",
                name: "username",
                message: "Insert the username - Ctrl+c to exit" // question
            },
            {
                // parameters
                type: "password",
                name: "password",
                message: "Insert password - Ctrl+c to exit" // question
            }
        ])
            .then(answer => { // answer contain username and password property ( name property of question )

                dbConfig.username = answer.username;
                dbConfig.password = answer.password;
                dbConfig.MongoUri = "mongodb+srv://" + dbConfig.username + ":" + dbConfig.password + "@cluster-youtubedownload.v9azt.mongodb.net/youtubeDownloadDB?retryWrites=true&w=majority"

                signale.pending("Connecting to database...")

                //Connect to Mongo
                mongoose.connect(dbConfig.MongoUri, { useNewUrlParser: true, useUnifiedTopology: true }).then(async () => {
                    signale.success("Database connected!");

                    // save the last access
                    await core.createLogAccess(dbConfig.username);

                    //control and create/update logs.txt file
                    await core.controlLogAccess();

                    resolve();

                }).catch((err) => {
                    signale.error("Authentication failed! " + err.codeName + " - Error code: " + err.code);
                })
            })
    })
}

/**
 * Show  or not application logo and start application
 */
function showLogo() {

        var optionsAsciify = {
            fit: 'box',
            width: 15,
            height: 15
        };
        asciify('./images/image.png', optionsAsciify, async function (err, asciified) {
            if (err) throw err;

            // Print to console
            console.log(asciified);

            webOrCli();
        })
}

/**
 * Web mode or CLI mode
 */
function webOrCli()   {
     
    // ask mode
     inquirer.prompt([
        {
            type: 'list',
            message: 'Choose if you want to use web mode or command line interface. Ctrl+C to exit',
            name: 'mode',
            default: 'web',
            choices: [
                {
                    name: "Web mode",
                    value: "web",
                },
                {
                    name: "Command line interface",
                    value: "cli",
                }
            ]
        }
    ]).then(async function (answer) {
        if(answer.mode == "web")    { // if answer is Web mode ( value of choices )
            createServer();
        } else if(answer.mode == "cli") { // if answer is Command line interface ( value of choices )
            await connectDb();
            core.selectMode();
        }
    })
}