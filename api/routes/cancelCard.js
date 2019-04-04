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
        if(req.body.clientID === undefined || req.body.clientID == ''){
            res.status(200).json({
                message: "No clientID was found"
            });
        } else {
            var clientID = req.body.clientID;
            res.locals.clientID = clientID;
            let connection = createConnection();
            connection.connect(function(err) {
                if(err) {
                    res.status(200).json({
                        status: "fail", 
                        message: "database connection issue on NFC module",
                    });
                    console.log(err.message);
                    connection.end(); 
                } else {
                    let query = 'Select * from CardAuthentication where clientID =' + clientID;
                    connection.query(query, function(err, rows){
                        if(rows.length == 0){
                            res.status(200).json({
                                status: "fail", 
                                message: "client not found in database",
                            });
                            connection.end();
                        } else {
                            connection.query(`UPDATE CardAuthentication SET active = 0 WHERE clientID = ${clientID}`, function (err, result) 
                            {
                                if (err) {
                                    console.log(err.message);
                                    res.status(200).json({
                                        status: "fail", 
                                        message: "database connection issue on NFC module",
                                    });
                                    connection.end();
                                } else {
                                    console.log(result.affectedRows + " record(s) updated");
                                    res.status(200).json({
                                        status: "success", 
                                        message: "card cancelled"
                                    });
                                    connection.end();
                                }   
                            });
                        }
                    });
                }
            });
        }
        next();
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////  Log Card Cancellations /////////////////////////////////////////////
    
    function logCancel(req, res) {

        let connection = createConnection();

        var clientID = req.body.clientID;   // clientID should be set in cancelCard when they
        
        if(clientID === undefined || clientID ===''){
            console.log('Client ID not found')
        }else {
            connection.connect(function(err) {
                if(err){
                    res.status(200).json({
                        message: "could not log card cancellation. Database connection issue on NFC module",
                        error: err.message
                    });
                    connection.end();
                } else {

                    connection.query(`SELECT * FROM CardAuthentication WHERE clientID = ${res.locals.clientID}`, (err, rows) => {
                        if(err){
                            res.status(200).json({
                                message: "client not found"
                            });

                           console.log("client not found");
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
                                        console.log("successfully logged card cancellation to log file.");
                                    });
                                    // **************************************************
                                }  
        
                            } else {
                                res.status(200).json({
                                    message: "client not found"
                                });

                                console.log("client not found");
                            }
                        }
                    }); 
                }
            });
        }
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = router;