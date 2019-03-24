const express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');

    // Create connection to JawsDB Database
// var connection = mysql.createConnection(process.env.JAWSDB_URL);
function createConnection(){
    let connection = mysql.createConnection({
        host     : 'bmsyhziszmhf61g1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        database : 'vjjekhqqcjiymvbw',
        user     : 'x5egnnu6zrkw3t21',
        password : 'h3fbdgtreyr4gr0g',
        port: '3306'
    });
    return connection;
}

// //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// //                                              GET/POST REQUEST    
// //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// // Handle GET request (will first call authenticateNFC function and the logAuthentication)
router.get('/', authenticateNFC, logAuthentication);

// // Handle POST request (will first call authenticateNFC function and the logAuthentication)
router.post('/', authenticateNFC, logAuthentication);

// ////////////////////////////////////////////  Card Authentication  ///////////////////////////////////////////////////

function authenticateNFC(req, res, next) {
    const qs = {
        cardID: req.query.cardID,
        pin: req.query.pin
    };

    if(qs.cardID === undefined || qs.pin === undefined){
        res.status(404).json({
            error: "GET Failed",
            message: "Expected different JSON data",
            paramsReceived: qs
        });
    }
    else{
        let connection = createConnection();
        connection.connect(function(err){
            if(err){
                res.status(200).json({
                    error: err,
                });
                connection.end();
            }
            else{
                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(404).json({
                            error: err
                        });
                        connection.end();
                    }
                    else{
                        if(rows.length > 0){
                            res.status(200).json({
                                cardID : rows[0].cardID,
                                clientID : rows[0].clientID,
                                active: rows[0].active,
                                salt: rows[0].salt,
                                pin: rows[0].pin
                            });
                            connection.end();
                            next();
                        }
                        else{
                            res.status(404).json({
                                error: "Card id not found"
                            });
                            connection.end();
                        }
                    }
                });
            }
        });
    }
    console.log("Card Authenticated");

    // Used to call "logAuthentication"
    
}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ////////////////////////////////////////////  Log Card Auth  //////////////////////////////////////////////////
    
function logAuthentication(req, res) {
    console.log(req.query.cardID);
    
    let connection = createConnection();
    connection.connect(function(err){
        if(err){
            console.log(err.message);
            connection.end();
        }
        else{
            var cardID = req.query.cardID;   // cardID should be set in cardAuth when they 

            connection.query(`SELECT * FROM CardAuthentication WHERE cardID = ${cardID}`, (err, rows) => {
                if(err) {
                    console.log("Card ID not found");
                }
                else {
                    if(rows.length > 0){
                        var today = new Date();
                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        var dateTime = date+' '+time;
                        
                        var logType = "cardAuthentication";
                        var logData = {
                            "cardID":rows[0].cardID,
                            "cardType": rows[0].cardType,
                            "authenticated": "activated",   // ******************************* authenticated?
                            "timestamp": dateTime
                        }
                            
        //                 // **************************************************
        //                 //              Write JSON to textfile       
        //                 // -------------------------------------------------  
        //                 // var log = {
        //                 //     "logType": logType,
        //                 //     "logData": logData
        //                 // }
        //                 //     // add log to textFile
        //                 // **************************************************

        //                 // send log to reporting  (qs: {"logType":logtype, "logFile": file})
                        request.get({url: "https://safe-journey-59939.herokuapp.com/", qs: {"logType": logType, "logData": logData}}, function(err, response, body) {
                            // console.log(err, body);
                            connection.end();
                        });    
                    }
                    else {
                        connection.end();
                    }
                }
            });
        }
   });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;