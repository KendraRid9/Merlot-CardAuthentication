var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');


// // Create connection to JawsDB Database
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
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//                                              GET/POST REQUEST    
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    // Handle GET request (will first call cancelCard function and then logCancel)
    router.get('/', cancelCard, logCancel);

    // Handle POST request (will first call cancelCard function and then logCancel)
    router.post('/', cancelCard, logCancel);

//////////////////////////////////////////////  Cancel Cards  /////////////////////////////////////////////////////

    function cancelCard(req, res, next) {
        if(req.query.clientID === undefined || req.query.clientID == ''){
            res.status(404).json({
                message: "No clientID was found"
            });
        } else {
            let connection = createConnection();
            connection.connect(function(err) {
                if(err) {
                    console.log(err.message);
                } else {
                    // ********************************
                        // Cancel Cards Code Here... 
                    // ********************************
                    res.status(200).json({
                        message: "Card cancelled"
                    });
                    connection.end();
                    next();
                }
            });
        }
        
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////  Log Card Cancellations /////////////////////////////////////////////
    
    function logCancel(req, res) {
        let connection = createConnection();
        connection.connect(function(err) {
            if(err){
                console.log(err.message);
            }
        
            var clientID = req.query.clientID;   // clientID should be set in cancelCard when they 

            connection.query(`SELECT * FROM CardAuthentication WHERE clientID = ${clientID}`, (err, result) => {
                if(err){
                   console.log("client not found");
                   connection.end();
                } else {

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
                        console.log(err, body);
                        connection.end();
                    })    
                }
            });    
        });
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;