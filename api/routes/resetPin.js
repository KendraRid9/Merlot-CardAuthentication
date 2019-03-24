var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');


// Create connection to JawsDB Database
var connection = mysql.createConnection(process.env.JAWSDB_URL);

// Connect to DB
connection.connect(function(err) {
    if(err) throw err;

     // variable to hold cardID (received in JSON format)
    //  const cardID;


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//                                              GET/POST REQUEST    
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    // Handle GET request (will first call resetPIN function and the logReset)
    router.get('/', resetPIN, logReset);

    // Handle POST request (will first call resetPIN function and the logReset)
    router.post('/', resetPIN, logReset);

//////////////////////////////////////////////  Reset PIN  /////////////////////////////////////////////////////

    function resetPIN(req, res, next) {
        
        // ********************************
            // Reset PIN Code Here... 
        // ********************************
        console.log("PIN Reset");
        
        
        // Used to call "logReset"
        next();
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////////  Log PIN Reset  //////////////////////////////////////////////////
    
    function logReset(req, res) {
    
        var cardID = req.query.cardID;  

        connection.query(`SELECT * FROM CardAuthentication WHERE cardID = ${cardID}`, (err, rows) => {
            if(err) throw err;

            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;
            
            var logType = "resetPIN";
            var logData = {
                "cardID":rows[0].cardID,
                "cardType": rows[0].cardType,
                "clientID" : rows[0].clientID,
                "description": "resetPIN",
                "timestamp": dateTime
            }

            // **************************************************
            //              Write JSON to textfile       
            // -------------------------------------------------  
            // var log = {
            //     "logType": logType,
            //     "logData": logData
            // }
            //     // add log to textFile
            // **************************************************

            // send log to reporting  (qs: {"logType":logtype, "logFile": file})
            request.get({url: "https://safe-journey-59939.herokuapp.com/", qs: {"logType": logType, "logData": logData}}, function(err, response, body) {
                res.status(200).json( {
                    "return:": body
                });
                console.log(err, body);
            })    
        });

        
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////




    // connection.end();
});

module.exports = router;