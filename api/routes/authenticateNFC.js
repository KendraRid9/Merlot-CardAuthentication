const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const request = require("request");
const fs = require('fs');
const bcrypt = require('bcrypt');

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
router.get('/', authenticateGetNFC, logAuthentication);

// // Handle POST request (will first call authenticateNFC function and the logAuthentication)
router.post('/', authenticatePostNFC, logAuthentication);

// ////////////////////////////////////////////  Card Authentication  ///////////////////////////////////////////////////

function authenticateGetNFC(req, res, next) {
    const qs = {
        cardID: req.query.cardID,
        pin: req.query.pin
    };

    if(qs.cardID != undefined){
        res.locals.cardID == qs.cardID;
    } else {
        res.locals.cardID = '';
    }

    if(qs.pin != undefined){
        res.locals.pin == qs.pin;
    } else {
        res.locals.pin = '';
    }
    
    if((qs.cardID === undefined || qs.cardID == '') && (qs.pin === undefined ||qs.pin == '')){
        res.status(404).json({
            error: "GET Failed",
            message: "Expected cardID"
        });
    }

    //Only cardID is passed through
    else if (qs.cardID !== undefined && qs.pin === undefined){
        let connection = createConnection();
        connection.connect(function(err){
            if(err){
                res.status(404).json({
                    message: "Database connection issue on NFC module",
                    error: err.message
                });
                connection.end();
            }else{
                res.locals.cardID = qs.cardID;

                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 0){
                        res.status(200).json({
                            status: "NotAuthenticated",
                        });
                        connection.end();
                        res.locals.description = "card deactivated";
                        res.locals.authenticated = "0"
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 1){
                        res.status(200).json({
                            status: "Authenticated",
                            clientID: rows[0].clientID
                        });
                        connection.end();
                        res.locals.description = "authenticated";
                        res.locals.authenticated = "1"
                        next();
                    } else {
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                });
            }
        });
    }
    //Both cardID and pin are passed through
    else if(qs.cardID !== undefined && qs.pin !==undefined){
        let connection = createConnection();
        connection.connect(function(err){
            if(err){
                res.status(404).json({
                    message: "Database connection issue on NFC module",
                    error: err,
                });
                connection.end();
            }else{
                res.locals.cardID = qs.cardID;
                res.locals.pin = qs.pin;

                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 0){
                        res.status(200).json({
                            status: "NotAuthenticated",
                        });
                        connection.end();
                        res.locals.description = "card deactivated";
                        res.locals.authenticated = "0"
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 1){
                        let hash = rows[0].pin;
                        let pinMatch = bcrypt.compareSync(qs.pin, hash);

                        if(pinMatch == false) {
                            res.status(200).json({
                                status: "NotAuthenticated",
                                clientID: rows[0].clientID
                            });
                            connection.end();
                            res.locals.description = "PIN invalid";
                            res.locals.authenticated = "0"
                            next();
                        } else {
                            res.status(200).json({
                                status: "Authenticated",
                                clientID: rows[0].clientID
                            });
                            connection.end();
                            res.locals.description = "authenticated";
                            res.locals.authenticated = "1"
                            next();
                        }
                    } else {
                        
                    }
                });
            }
        });
    }
    //Any other error that may occur
    else {
        res.status(404).json({
            error: "GET Failed",
            message: "We messed up somewhere, and we don't know why. You should honestly not be getting this error. Sorry.",
        });
        connection.end();
    } 
}


//Post request for authenticate card
function authenticatePostNFC(req, res, next) {
    const qs = {
        cardID: req.query.cardID,
        pin: req.query.pin
    };

    if(qs.cardID != undefined){
        res.locals.cardID == qs.cardID;
    } else {
        res.locals.cardID = '';
    }

    if(qs.pin != undefined){
        res.locals.pin == qs.pin;
    } else {
        res.locals.pin = '';
    }
    
    if((qs.cardID === undefined || qs.cardID == '') && (qs.pin === undefined ||qs.pin == '')){
        res.status(404).json({
            error: "POST Failed",
            message: "Expected cardID"
        });
    }

    //Only cardID is passed through
    else if (qs.cardID !== undefined && qs.pin === undefined){
        let connection = createConnection();
        connection.connect(function(err){
            if(err){
                res.status(404).json({
                    message: "Database connection issue on NFC module",
                    error: err.message
                });
                connection.end();
            }else{
                res.locals.cardID = qs.cardID;

                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 0){
                        res.status(200).json({
                            status: "NotAuthenticated",
                        });
                        connection.end();
                        res.locals.description = "card deactivated";
                        res.locals.authenticated = "0"
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 1){
                        res.status(200).json({
                            status: "Authenticated",
                            clientID: rows[0].clientID
                        });
                        connection.end();
                        res.locals.description = "authenticated";
                        res.locals.authenticated = "1"
                        next();
                    } else {
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                });
            }
        });
    }
    //Both cardID and pin are passed through
    else if(qs.cardID !== undefined && qs.pin !==undefined){
        let connection = createConnection();
        connection.connect(function(err){
            if(err){
                res.status(404).json({
                    message: "Database connection issue on NFC module",
                    error: err,
                });
                connection.end();
            }else{
                res.locals.cardID = qs.cardID;
                res.locals.pin = qs.pin;

                connection.query("SELECT * FROM CardAuthentication WHERE cardID='" + qs.cardID + "'", function(err, rows) {
                    if(err){
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 0){
                        res.status(200).json({
                            status: "NotAuthenticated",
                        });
                        connection.end();
                        res.locals.description = "card deactivated";
                        res.locals.authenticated = "0"
                        next();
                    }
                    else if(rows.length > 0 && rows[0].active == 1){
                        let hash = rows[0].pin;
                        let pinMatch = bcrypt.compareSync(qs.pin, hash);

                        if(pinMatch == false) {
                            res.status(200).json({
                                status: "NotAuthenticated",
                                clientID: rows[0].clientID
                            });
                            connection.end();
                            res.locals.description = "PIN invalid";
                            res.locals.authenticated = "0"
                            next();
                        } else {
                            res.status(200).json({
                                status: "Authenticated",
                                clientID: rows[0].clientID
                            });
                            connection.end();
                            res.locals.description = "authenticated";
                            res.locals.authenticated = "1"
                            next();
                        }
                    } else {
                        res.status(200).json({
                            status: "NotAuthenticated",
                            clientID: "None"
                        });
                        connection.end();
                        res.locals.description = "cardID not found";
                        res.locals.authenticated = "0";
                        next();
                    }
                });
            }
        });
    }
    //Any other error that may occur
    else {
        res.status(404).json({
            error: "POST Failed",
            message: "We messed up somewhere, and we don't know why. You should honestly not be getting this error. Sorry.",
        });
        connection.end();
    } 
}

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ////////////////////////////////////////////  Log Card Auth  //////////////////////////////////////////////////
    
function logAuthentication(req, res) {
    
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
                            var jsonString = `,{\"logType\":\"cardAuthentication\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"status\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
                        } else {
                            // json string for log
                            var jsonString = `{\"logType\":\"cardAuthentication\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"status\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
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