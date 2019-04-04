var express = require('express');
var mysql = require('mysql');
const router = express.Router();
const request = require("request");
var fs = require('fs');
const bcrypt = require('bcrypt-nodejs');

router.post('/', cards);

function cards(req, res, next)
{
    // read log objects from file
    fs.readFile('test.txt', (err, contents) => {
       
        if(err) {
          console.log(err.message);
          res.status(200).json({
            status: "fail",
            message: "no file"
          });
        }
        else{
            res.status(200).send(contents);
        }
    });
}

module.exports = router;