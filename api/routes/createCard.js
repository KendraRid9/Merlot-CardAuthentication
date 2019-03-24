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
    
    // Handle GET request (will first call createCard function and then logCreate)
    router.get('/', createCard, logCreate);

    // Handle POST request (will first call createCard function and then logCreate)
    router.post('/', createCard, logCreate);

//////////////////////////////////////////////  Create Card  /////////////////////////////////////////////////////

    function createCard(req, res, next) {
        
        // ********************************
            // Create Card Code Here... 
        // ********************************
        console.log("Card Createed");
        
        
        // Used to call "logCreate"
        next();
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////////  Log Create Card  //////////////////////////////////////////////////
    
    function logCreate(req, res) {

        connection.query(`SELECT * FROM CardAuthentication ORDER BY cardID DESC LIMIT 1`, (err, rows) => {
            if(err) throw err;

            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date+' '+time;
            
            var logType = "cardCreateed";
            var logData = {
                "cardID":rows[0].cardID,
                "cardType": rows[0].cardType,
                "clientID" : rows[0].clientID,
                "description": "activated",
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