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
    
    // Handle GET request (will first call resetPIN function and the logReset)
    router.get('/', resetPIN, logReset);

    // Handle POST request (will first call resetPIN function and the logReset)
    router.post('/', resetPIN, logReset);

//////////////////////////////////////////////  Reset PIN  /////////////////////////////////////////////////////

function resetPIN(req, res, next) {
    if(req.query.cardID === undefined || req.query.cardID == ''){
        res.status(404).json({
            message: "No Card ID was found"
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
                    message: "PIN reset"
                });
                connection.end();
                next();
            }
        });
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////////  Log PIN Reset  //////////////////////////////////////////////////
    
    function logReset(req, res) {
        let connection = createConnection();
        var cardID = req.query.cardID;  
        if(cardID === undefined || cardID ===''){
            console.log('Card ID not found')
        }else {
            connection.connect(function(err) {
                if(err) {
                    console.log(err.message);
                }
                else{
                    connection.query(`SELECT * FROM CardAuthentication WHERE cardID = ${cardID}`, (err, rows) => {
                        if(err){
                            console.log(err.message);
                            console.log("Invalid card ID");
                        }
                        else{
                            if(rows.length > 0){
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
                                    console.log(body)
                                    connection.end();
                                })    
                            } else {
                                console.log("Client not found");
                            }
                        }
                    });
                }
            });
        }
        
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;