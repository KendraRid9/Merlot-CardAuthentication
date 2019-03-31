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
            var clientID = req.query.clientID;
            res.locals.clientID = clientID;
            let connection = createConnection();
            connection.connect(function(err) {
                if(err) {
                    console.log(err.message);
                } else {
                    // ********************************
                        // Cancel Cards Code Here... 
                    // ********************************
                    res.status(200).json({
                        message: "Cards cancelled"
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

        if(res.locals.clientID !== undefined && res.locals.clientID !== ''){
            
            let connection = createConnection();
            connection.connect(function(err) {
                if(err){
                    res.status(404).json({
                        message: "Could not log card cancellation. Database connection issue on NFC module",
                        error: err.message
                    });
                    connection.end();
                } else {

                    connection.query(`SELECT * FROM CardAuthentication WHERE clientID = ${res.locals.clientID}`, (err, rows) => {
                        if(err){
                           console.log("Client not found");
                           connection.end();
                        }
                        else {

                            if(rows.length > 0) {
                                
                                //get timestamp
                                var today = new Date();
                                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                var dateTime = date + ' ' + time;

                                // iterate for all the rows in result
                                for (var i = 0; i < rows.length; i++) {

                                    if(rows[i].active == '0') {
                                        var log = {
                                            "logType" : "cardCancelled",
                                            "cardID" : rows[i].cardID,
                                            "cardType" : rows[i].cardType,
                                            "clientID" : res.locals.clientID,
                                            "description" : "de-activated",
                                            "success" : "1",
                                            "timestamp" : dateTime
                                        }
                                        if (fs.existsSync("logs.txt")) {
                                            // json string for log
                                            //var jsonString = `,{\"logType\":\"cardCancellation\",\"cardID\":\"${rows[i].cardID}\",\"cardType\":\"${rows[i].cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"de-activated\",\"success\":\"1\",\"timestamp\":\"${dateTime}\"}}`;
                                        
                                            var jsonString = "," + JSON.stringify(log);
                                        } else {
                                            // json string for log
                                            //var jsonString = `{\"logType\":\"cardCancellation\",\"cardID\":\"${rows[i].cardID}\",\"cardType\":\"${rows[i].cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"de-activated\",\"success\":\"1\",\"timestamp\":\"${dateTime}\"}}`;
                                        
                                            var jsonString = JSON.stringify(log);
                                        }

                                    } else {
                                        var log = {
                                            "logType" : "cardCancelled",
                                            "cardID" : rows[i].cardID,
                                            "cardType" : rows[i].cardType,
                                            "clientID" : res.locals.clientID,
                                            "description" : "error",
                                            "success" : "0",
                                            "timestamp" : dateTime
                                        }

                                        if (fs.existsSync("logs.txt")) {
                                            // json string for log
                                            //var jsonString = `,{\"logType\":\"cardCancellation\",\"cardID\":\"${rows[i].cardID}\",\"cardType\":\"${rows[i].cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"de-activated\",\"success\":\"1\",\"timestamp\":\"${dateTime}\"}}`;
                                        
                                            var jsonString = "," + JSON.stringify(log);
                                        } else {
                                            // json string for log
                                            //var jsonString = `{\"logType\":\"cardCancellation\",\"cardID\":\"${rows[i].cardID}\",\"cardType\":\"${rows[i].cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"de-activated\",\"success\":\"1\",\"timestamp\":\"${dateTime}\"}}`;
                                        
                                            var jsonString = JSON.stringify(log);
                                        }
                                    }

                                    // **************************************************
                                    //              Write JSON to textfile       
                                    // -------------------------------------------------  
                                    fs.appendFile("logs.txt", jsonString, function(err, data) {
                                        if (err) console.log(err.message);
                                        console.log("Successfully Logged Card Cancellation to Log File.");
                                    });
                                    // **************************************************
                                }  
        
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