const signale = require('signale'); //library to insert status report
const inquirer = require('inquirer'); //library for use interavtive commands
const asciify = require('asciify-image'); //library for create asciify images
const mongoose = require("mongoose");
const dbConfig = require("./config/db");
const createServer = require("./webMode/webServer");
const core = require("./assets/js/core");

connectDb();

function connectDb() {

    signale.pending("Connecting to database...")

    //Connect to Mongo
    mongoose.connect(dbConfig, { useNewUrlParser: true, useUnifiedTopology: true  }).then(async () => {
        signale.success("Database connected!");

        // save the last access
        await core.createLogAccess();
        
        //control and create logs.txt file
        await core.controlLogAccess();
        
        showLogo();

    }).catch((err) => {
        console.log(err);
    })
}

var infoVideo = null;

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
    ]).then(function (answer) {
        if(answer.mode == "web")    { // if answer is Web mode ( value of choices )
            createServer();
        } else if(answer.mode == "cli") { // if answer is Command line interface ( value of choices )
            core.selectMode();
        }
    })
}