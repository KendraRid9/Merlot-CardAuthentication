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
    if(req.query.clientID === undefined || req.query.clientID == ''){
        res.status(404).json({
            message: "No Client ID was found"
        });
    } else {
        let connection = createConnection();
        connection.connect(function(err) {
            if(err) {
                console.log(err.message);
            } else {
                // ********************************
                    // Reset PIN Code Here... 
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

        var clientID = req.query.clientID;  

        if(clientID === undefined || clientID ===''){
            console.log('Client ID not found')
        }else {
            connection.connect(function(err) {
                if(err) {
                    console.log(err.message);
                }
                else{
                    connection.query(`SELECT * FROM CardAuthentication WHERE clientID = ${clientID}`, (err, rows) => {
                        if(err){
                            console.log(err.message);
                            console.log("Invalid Client ID");
                        }
                        else{
                            if(rows.length > 0){

                                var cards = "";

                                // iterate for all the rows in result
                                for (var i = 0; i < rows.length; i++) {
                                    cards += "{";
                                    cards += `\"cardID\": \"${rows[i].cardID}\",`;
                                    cards += `\"cardType\": \"${rows[i].cardType}\"`;    // ADDING "," ?????
                                    cards += "}"
                                    if(i < (rows.length-1)){
                                        cards += ","
                                    }
                                }

                                // get timestamp
                                var today = new Date();
                                var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                                var dateTime = date+' '+time;

                                if (fs.existsSync("auth.txt")) {
                                    // json string for log
                                    var jsonString = `,{\"logType\":\"resetPIN\",\"logData\":{\"clientID\":\"${clientID}\",\"description\":\"cardsPINReset\",\"timestamp\":\"${dateTime}\",\"cards\":[ ${cards} ]}}`;
                                } else {
                                    // json string for log
                                    var jsonString = `{\"logType\":\"resetPIN\",\"logData\":{\"clientID\":\"${clientID}\",\"description\":\"cardsPINReset\",\"timestamp\":\"${dateTime}\",\"cards\":[ ${cards} ]}}`;
                                }
                                

                                // **************************************************
                                //              Write JSON to textfile       
                                // -------------------------------------------------  
                                fs.appendFile("auth.txt", jsonString, function(err, data) {
                                    if (err) console.log(err);
                                    console.log("Successfully Logged PIN Reset to Log File.");
                                });
                                // **************************************************
  
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