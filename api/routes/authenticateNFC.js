const express = require('express');
var mysql = require('mysql');
const router = express.Router();

// var connection = mysql.createConnection(process.env.JAWSDB_URL);
function createConnection(){
    let connection = mysql.createConnection({
        host     : 'nuskkyrsgmn5rw8c.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        database : 'knbgbofthudg7j4p',
        user     : 'z05gg84p5ha4qfuc',
        password : 'wnqm0zb1vi19m7n3',
        port: '3306'
    });
    return connection;
}

router.get('/', (req, res, next) => {
    const qs = {
        cardID: req.body.cardID,
        pin: req.body.pin
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
                        }
                        else{
                            res.status(404).json({
                                error: "card id not found"
                            });
                            connection.end();
                        }
                    }
                });
            }
        });
    }
});

module.exports = router;