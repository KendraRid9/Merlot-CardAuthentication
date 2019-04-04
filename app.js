const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const authenticateRoute = require('./api/routes/authenticateNFC');
const cancelCardRoute = require('./api/routes/cancelCard');
const createCardRoute = require('./api/routes/createCard');
const sendLogsRoute = require('./api/routes/sendLogs');
const displayHTML = require('./api/routes/displayHTML');
const testRoute = require('./api/routes/test');


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Prevent CORS violation
app.use(cors());

//Send any requests with authenticateNFC to the correct route
app.use('/authenticateNFC', authenticateRoute);
app.use('/createCard', createCardRoute);
app.use('/cancelCard', cancelCardRoute);
app.use('/sendLogs', sendLogsRoute);
app.use('/',displayHTML)
app.use('/test',testRoute)


//Error handling when url doesn't exist
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

//Error handling for thrown error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    }); 
});

module.exports = app;