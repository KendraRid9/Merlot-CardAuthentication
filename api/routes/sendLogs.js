var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//                                              GET/POST REQUEST    
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    // Handle GET request 
    router.get('/', (req, res) => {

      // read log objects from file
      fs.readFile('auth.txt', (err, contents) => {
       
        if(err) {
          console.log(err.message);
        }
        else{
          // create json array
          var jsonString = `{"logs":[ ${contents} ]}`;

          // overwrite text file with json array
          fs.writeFile("auth.txt", jsonString, (err, data) => {
            if (err) {
              console.log(err.message);
            }
            else {
              console.log("Successfully Written Log Array to Log File.");

              //send log to reporting  (qs: {"logType":logtype, "logFile": file})
              request.get({url: "https://safe-journey-59939.herokuapp.com/logData", qs: {"logFile": jsonString}}, (err, res, body) => {
                if(err) {
                  console.log(err.message);
                }
                else {
                  if(body == "OK"){ // ******* must be Reporting specific (what's ther return value)
                    fs.unlink("auth.txt", (err) => {
                      if(err) console.log(err.message);
                      else console.log("Log File Deleted");
                    });
                  }
                }
              });
            } 
          });

          res.status(200).send("Logs sent");
        }
      });  
    });



    // Handle POST request 
    router.post('/', (res, req) => {

       // read log objects from file
      fs.readFile('auth.txt', (err, contents) => {
       
        if(err) {
          console.log(err.message);
        }
        else{
          // create json array
          var jsonString = `{"logs":[ ${contents} ]}`;

          // overwrite text file with json array
          fs.writeFile("auth.txt", jsonString, (err, data) => {
            if (err) {
              console.log(err.message);
            }
            else {
              
              console.log("Successfully Written Log Array to Log File.");

              //send log to reporting  (qs: {"logType":logtype, "logFile": file})
              request.get({url: "https://safe-journey-59939.herokuapp.com/logData", qs: {"logFile": jsonString}}, (err, res, body) => {
                if(err) {
                  console.log(err.message);
                }
                else {
                  if(body == "OK"){ // ******* must be Reporting specific (what's ther return value)
                    fs.unlink("auth.txt", (err) => {
                      if(err) console.log(err.message);
                      else console.log("Log File Deleted");
                    });
                  }
                }
              });

              
            } 
          });

          res.status(200).send("Logs sent");
        }
      });      
    });

module.exports = router;