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

    req.authenticated = 0;

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
                res.status(404).json({
                    message: "Database connection issue",
                    error: err,
                });
                connection.end();
            }
            else{
                res.locals.cardID = qs.cardID;
                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(404).json({
                            error: "Card ID not in database"
                        });
                        connection.end();
                        res.locals.authenticated = "0";
                        // Used to call "logAuthentication"
                        next();
                    }
                    else{
                        if(rows.length > 0){
                            // let hash = rows[0].salt + qs.pin;
                            let hash = qs.pin;
                            if(hash == rows[0].pin){
                                connection.end();
                                res.status(200).json({
                                    status: "Authorized",
                                    clientID: qs.clientID,
                                    active: rows[0].active
                                });
                                req.authenticated = 1;
                            } else {
                                connection.end();
                                res.status(200).json({
                                    status: "NotAuthorized",
                                    reason: "Incorrect Pin"
                                });
                                req.authenticated = 0;
                            }
                        }
                        else{
                            res.status(404).json({
                                error: "Card ID not in database"
                            });
                            connection.end();
                            res.locals.authenticated = "0";
                            // Used to call "logAuthentication"
                            next();
                        }
                    }
                });
            }
        });
    }
    next();
    console.log("Card Authenticated");

    
}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ////////////////////////////////////////////  Log Card Auth  //////////////////////////////////////////////////
    
function logAuthentication(req, res) {
    console.log(res.locals.authenticated);
    
    let connection = createConnection();
    connection.connect(function(err){
        if(err){
            console.log(err.message);
            connection.end();
        }
        else{

            connection.query(`SELECT * FROM CardAuthentication WHERE cardID = ${res.locals.cardID}`, (err, rows) => {
                if(err) {
                    console.log("Card ID not found");
                }
                else {
                    if(rows.length > 0){

                        //get timestamp
                        var today = new Date();
                        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        var dateTime = date+' '+time;
                        
                        if (fs.existsSync("auth.txt")) {
                            // json string for log
                            var jsonString = `,{\"logType\":\"cardAuthentication\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"authenticated\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
                        } else {
                            // json string for log
                            var jsonString = `{\"logType\":\"cardAuthentication\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"authenticated\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
                        }
                       

                        // **************************************************
                        //              Write JSON to textfile       
                        // -------------------------------------------------  
                        fs.appendFile("auth.txt", jsonString, function(err, data) {
                            if (err) console.log(err);
                            console.log("Successfully Logged Card Authentication to Log File.");
                        });
                        // **************************************************
                            
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