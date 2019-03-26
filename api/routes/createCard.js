var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;


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
    connection.connect(function (err)
    {
        if (err)
        {
            console.log(err.message);
        }
        else
        {
            let cardID, cardType, pin, hashPin, salt, activeStatus;

            cardType = Math.round(Math.random()) === 1 ? "NFC" : "Bank";
            pin = Math.floor(1000 + Math.random() * 9000);
            salt = bcrypt.genSaltSync(saltRounds);
            hashPin = bcrypt.hashSync(pin,salt);
            activeStatus = 1;

            console.log("Created Card");
            console.log("Pin Hash: " + hashPin);
            console.log("Salt: " + salt);

            let sql = `INSERT INTO clients(clientID,cardType,active,pin,salt) VALUES(?,?,?,?,?)`;

            let values = [clientID,cardType,activeStatus,hashPin,salt];

            connection.query(sql,values,(err,results,fields) =>
            {
               if(err)
               {
                   return console.error(err.message);
               }
               else
               {
                   console.log("Rows Inserted: " + results.affectedRows);
               }
            });

            res.locals.pin = pin;
            res.status(200).json({
                message: "Card Created"
            });
            connection.end();
            next();
        }
    });
}

function getSalt()
{
    var result = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 3; i++)
    {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////////  Log Create Card  //////////////////////////////////////////////////

function logCreate(req, res)
{
    let connection = createConnection();
    connection.connect(function (err)
    {
        if (err)
        {
            console.log(err.message);
            connection.end();
        }
        else
        {
            connection.query(`SELECT * FROM CardAuthentication ORDER BY cardID DESC LIMIT 1`, (err, rows) =>
            {
                if (err)
                {
                    console.log("Card ID not found");
                }
                else
                {

                    //get timestamp
                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date + ' ' + time;

                    if (fs.existsSync("auth.txt"))
                    {
                        // json string for log
                        var jsonString = `,{\"logType\":\"cardCreated\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"clientID\":\"${rows[0].clientID}\",\"description\":\"activated\",\"timestamp\":\"${dateTime}\"}}`;
                    }
                    else
                    {
                        // json string for log
                        var jsonString = `{\"logType\":\"cardCreated\",\"logData\":{\"cardID\":\"${rows[0].cardID}\",\"cardType\":\"${rows[0].cardType}\",\"clientID\":\"${rows[0].clientID}\",\"description\":\"activated\",\"timestamp\":\"${dateTime}\"}}`;
                    }


                    // **************************************************
                    //              Write JSON to textfile
                    // -------------------------------------------------
                    fs.appendFile("auth.txt", jsonString, function (err, data)
                    {
                        if (err) console.log(err);
                        console.log("Successfully Logged Card Creation to Log File.");
                    });
                    // **************************************************

                }
            });
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;