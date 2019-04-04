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
          var jsonString = `{"logs":[ ${contents} ],"system":"nfc"}`;

          var postData = {
            "log_set": JSON.parse(jsonString)
          }

          var options = { 
                method: 'POST',
                url: 'https://still-oasis-34724.herokuapp.com/uploadLog',
                headers: 
                { 
                  'Postman-Token': '5d1436e7-228e-421b-bb71-5083dabb6b22',
                  'cache-control': 'no-cache',
                  'Content-Type': 'application/json'
                },
                body: postData,
                json: true
            };

          //send log to reporting  
          request(options, (err, response, body) => {
            if(err) {
              res.status(200).json({
                status: "fail",
                message: "could not send logs",
                error: err.message
              });
              console.log(err.message);
            }
            else {
              if(response.statusCode == 200) {

                res.status(200).json({
                  status: "success",
                  message: "logs sent",
                  response: body,
                  data: postData
                });

                fs.unlink("logs.txt", (err) => {
                  if(err){
                    console.log("Log file could not be reset");  
                  } else {
                    console.log("Log file reset");
                  }
                });
              } else {
                res.status(200).json({
                  status: "fail",
                  message: "could not send logs",
                  response: body,
                  data: postData
                });
              }
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
          res.status(200).json({
            status: "fail",
            message: "no logs to send"
          });
        }
        else{

          // create json array
          var jsonString = `{"logs":[ ${contents} ],"system":"nfc"}`;

          var postData = {
            "log_set": JSON.parse(jsonString)
          }

          var options = { 
                method: 'POST',
                url: 'https://still-oasis-34724.herokuapp.com/uploadLog',
                headers: 
                { 
                  'Postman-Token': '5d1436e7-228e-421b-bb71-5083dabb6b22',
                  'cache-control': 'no-cache',
                  'Content-Type': 'application/json'
                },
                body: postData,
                json: true
            };

          //send log to reporting  
          request(options, (err, response, body) => {
            if(err) {
              res.status(200).json({
                status: "fail",
                message: "could not send logs",
                error: err.message
              });
              console.log(err.message);
            }
            else {
              if(response.statusCode == 200) {

                res.status(200).json({
                  status: "success",
                  message: "logs sent",
                  response: body,
                  data: postData
                });

                fs.unlink("logs.txt", (err) => {
                  if(err){
                    console.log("Log file could not be reset");  
                  } else {
                    console.log("Log file reset");
                  }
                });
              } else {
                res.status(200).json({
                  status: "fail",
                  message: "could not send logs",
                  response: body,
                  data: postData
                });
              }
            }
          });
      }
      });
    });

////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

module.exports = router;