var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');
const bcrypt = require('bcrypt-nodejs');



// Create connection to JawsDB Database
// var connection = mysql.createConnection(process.env.JAWSDB_URL);

function createConnection()
{
    let connection = mysql.createConnection({
        host: 'bmsyhziszmhf61g1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        database: 'vjjekhqqcjiymvbw',
        user: 'x5egnnu6zrkw3t21',
        password: 'h3fbdgtreyr4gr0g',
        port: '3306'
    });
    return connection;
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//                                              GET/POST REQUEST    
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Handle GET request (will first call createCard function and then logCreate)
router.get('/', createCard, logCreate);

// Handle POST request (will first call createCard function and then logCreate)
router.post('/', createCard, logCreate);

//////////////////////////////////////////////  Create Card  /////////////////////////////////////////////////////

function createCard(req, res, next)
{
    var clientID = req.body.clientID;
    let connection = createConnection();
    let resStatus = "success";
    let resMessage = "card created";

    if(clientID === undefined || clientID === "")
    {
        console.log("No ClientID Received");
        res.status(200).json({
            status: "fail",
            message: "no clientID received"
        });
       // next();
        return;
    }
    connection.connect(function (err)
    {
        if (err)
        {
            console.log(err.message);
            resStatus = "fail";
            resMessage = err.message;
            res.status(200).json({
                status: "fail",
                message: resMessage
            });
            connection.end();
        }
        else
        {
            let cardID, cardType, pin, hashPin, salt, activeStatus;

            cardType = (Math.round(Math.random()) === 1) ? "NFC" : "Bank";
            pin = Math.floor(1000 + Math.random() * 9000); // generate random 4 digit pin
            salt = bcrypt.genSaltSync();
            hashPin = bcrypt.hashSync(pin,salt);
            activeStatus = 1; // set active to true

        /* console.log("Created Card");
            console.log("Pin: " + pin);
            console.log("Pin Hash: " + hashPin);
            console.log("Salt: " + salt);*/

            res.locals.pin = pin;
            console.log("PIN: " + pin);
            res.locals.clientID = clientID;    
            res.locals.cardType = cardType;

            let sql = `INSERT INTO CardAuthentication(clientID,cardType,active,pin) VALUES(?,?,?,?)`;

            let values = [clientID,cardType,activeStatus,hashPin];
            cardID = -1;
            connection.query(sql,values,(err,results,fields) =>
            {
                if(err)
                {
                    resStatus = "fail";
                    resMessage = err.message;
                    console.log(err.message);

                    res.status(200).json({
                        status: "fail",
                        message: resMessage
                    });

                    connection.end();
                    res.locals.description = err.message;
                    res.locals.success = "0";
                    res.locals.cardID = "-1";
                    next();
                }
                else
                {
                    cardID = results.insertId;
                    console.log("inserted card: " + cardID);
                    res.locals.description = "activated";
                    res.locals.success = "1";
                    res.locals.cardID = cardID;
            
                    // **************************************************************************************
                    //                       Notify Client Notification Subsystem      
                    // -------------------------------------------------------------------------------------- 
                    var jsonObject = {
                        "ClientID": res.locals.clientID,
                        "Type": "card",
                        "Content": {
                            "cardnumber": res.locals.cardID,
                            "pin": res.locals.pin
                        }
                    };
                    
                    // var stringified = JSON.stringify(jsonObject); //Stringify JSON object before using it in body

                    var options = { //Double check port once their API is up and running, ****NB****
                        method: 'POST',
                        url: 'https://ec2-35-174-115-93.compute-1.amazonaws.com',
                        port: 5000,
                        headers: { 
                            'Postman-Token': 'fe00621e-2cbe-4120-83c5-1b340d0b541e',
                            'cache-control': 'no-cache',
                            'Content-Type': 'application/json' 
                        },
                        body: jsonObject,
                        json: true
                    };

                    request(options, (err, response, body) => { //Logging on our side whether we successfully sent it to them or not
                        if(err) {
                            res.status(200).json({
                                status: resStatus,
                                message: resMessage,
                                notifyClient: false
                            });
                            console.log(err.message);
                        } else {
                            var obj = JSON.parse(body);
                            res.status(200).json({
                                status: resStatus,
                                message: resMessage,
                                notifyClient: obj.status
                            });
                            console.log(body)
                        }
                    })
                    // **************************************************************************************

                    connection.end();
                    next();  
                }
            });   
        }
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////  Log Create Card  //////////////////////////////////////////////////

function logCreate(req, res)
{
    if(res.locals.clientID != '' && res.locals.clientID !== undefined){

        //get timestamp
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + ' ' + time;
        
        var log = {
            "logType" : "cardCreated",
            "cardID" : res.locals.cardID,
            "cardType" : res.locals.cardType,
            "clientID" : res.locals.clientID,
            "description" : res.locals.description,
            "success" : res.locals.success,
            "timestamp" : dateTime
        }

        if (fs.existsSync("logs.txt")) {
            // json string for log
            // var jsonString = `,{\"logType\":\"cardAuthentication\",\"cardID\":\"${res.locals.cardID}\",\"cardType\":\"${res.locals.cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"${res.locals.description}\",\"success\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
            
            var jsonString = "," + JSON.stringify(log);
        
        } else {
            // json string for log
            //var jsonString = `{\"logType\":\"cardAuthentication\",\"cardID\":\"${res.locals.cardID}\",\"cardType\":\"${res.locals.cardType}\",\"clientID\":\"${res.locals.clientID}\",\"description\":\"${res.locals.description}\",\"success\":\"${res.locals.authenticated}\",\"timestamp\":\"${dateTime}\"}}`;
            
            var jsonString = JSON.stringify(log);
        }
        

        // **************************************************
        //              Write JSON to textfile       
        // -------------------------------------------------  
        fs.appendFile("logs.txt", jsonString, function(err, data) {
            if (err) console.log(err);
            else {
                 console.log("Successfully Logged Card Creation to Log File.");
            }
        });
        // **************************************************
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;