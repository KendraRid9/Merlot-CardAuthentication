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
    
    // Handle GET request (will first call cancelCard function and then logCancel)
    router.get('/', cancelCard, logCancel);

    // Handle POST request (will first call cancelCard function and then logCancel)
    router.post('/', cancelCard, logCancel);

//////////////////////////////////////////////  Cancel Cards  /////////////////////////////////////////////////////

    function cancelCard(req, res, next) {
        
        // ********************************
            // Cancel Cards Code Here... 
        // ********************************
        console.log("Cards Cancelled");
        
        
        // Used to call "logCancel"
        next();
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////  Log Card Cancellations /////////////////////////////////////////////
    
    function logCancel(req, res) {
    
        var clientID = req.query.clientID;   // clientID should be set in cancelCard when they 

        connection.query(`SELECT * FROM CardAuthentication WHERE clientID = ${clientID}`, (err, result) => {
            if(err) throw err;

            var cards = "{";

            // iterate for all the rows in result
            Object.keys(result).forEach(function(key) {
                var row = result[key];      
                cards += `cardID: ${row.cardID},`;
                cards += `cardType: ${row.cardType}`;    // ADDING "," ?????
            });

            cards += "}";

            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;
            
            var logType = "cardCanceled";
            var logData = {    
                "clientID" : clientID,
                "cards" : cards,
                "description": "deactivated",
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