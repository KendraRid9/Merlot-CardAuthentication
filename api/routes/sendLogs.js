var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');
var querystring = require('querystring')


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//                                              GET/POST REQUEST    
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  

////////////////////////////////////////////  Handle GET request  /////////////////////////////////////////////

    router.get('/', (req, res) => {

      // read log objects from file
      fs.readFile('logs.txt', (err, contents) => {
       
        if(err) {
          console.log(err.message);
          res.status(200).json({
            status: "fail",
            message: "no logs to send"
          });
        }
        else{

          // create json array
          var jsonString = `{"logs":[ ${contents} ]}`;
              
          var jsonObj = JSON.parse(jsonString);

          // console.log("querystring:" + querystring.stringify(jsonObj));
          // console.log("stringify:" + JSON.stringify(jsonObj));

          // var logObj = querystring.stringify(jsonObj);
          var logObj = JSON.stringify(jsonObj);

          var options = { 
                method: 'POST',
                url: 'https://safe-journey-59939.herokuapp.com/logData',
                // host: 'still-oasis-34724.herokuapp.com',
                // port: '80',
                port: '3000',
                // path: 'uploadLog',
                headers: 
                { 
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(logObj)
                },
                qs: {"logFile": logObj} 
            };

          //send log to reporting  
          request(options, (err, response, body) => {
            if(err) {
              console.log(err.message);
            }
            else {
              console.log(response.statusCode);
              fs.unlink("logs.txt", (err) => {
                if(err){
                  console.log(err.message);
                  res.status(200).json({
                    status: "fail",
                    message: "did not send Logs"
                  });
                } else {
                  console.log("Log File Deleted");
                  res.status(200).json({
                    status: "success",
                    message: "sent Logs"
                  });
                }
              });

              // send response back to /sendLogs request to notify them that logs were successfully sent
            }
          });
      }
      });
    });

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

////////////////////////////////////////////  Handle POST request  /////////////////////////////////////////////

    router.post('/', (req, res) => {

       // read log objects from file
      fs.readFile('logs.txt', (err, contents) => {
       
        if(err) {
          console.log(err.message);
          res.status(404).json({
            status: "fail",
            message: "no logs to send"
          });
        }
        else{

          // create json array
          var jsonString = `{"logs":[ ${contents} ]}`;
              
          var jsonObj = JSON.parse(jsonString);

          // console.log("querystring:" + querystring.stringify(jsonObj));
          // console.log("stringify:" + JSON.stringify(jsonObj));

          // var logObj = querystring.stringify(jsonObj);
          var logObj = JSON.stringify(jsonObj);

          var options = { 
                method: 'POST',
                url: 'https://safe-journey-59939.herokuapp.com/logData',
                // host: 'still-oasis-34724.herokuapp.com',
                // port: '80',
                port: '3000',
                // path: 'uploadLog',
                headers: 
                { 
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(logObj)
                },
                qs: {"logFile": logObj} 
            };

          //send log to reporting  
          request(options, (err, response, body) => {
            if(err) {
              console.log(err.message);
            }
            else {
              console.log(response.statusCode);
              fs.unlink("logs.txt", (err) => {
                if(err){
                  console.log(err.message);
                  res.status(200).json({
                    status: "fail",
                    message: "did not send Logs"
                  });
                } else {
                  console.log("Log File Deleted");
                  res.status(200).json({
                    status: "success",
                    message: "sent Logs"
                  });
                }
              });

              // send response back to /sendLogs request to notify them that logs were successfully sent
            }
          });
      }
      });
    });

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

module.exports = router;