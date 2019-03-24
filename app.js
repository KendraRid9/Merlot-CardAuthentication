const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const authenticateRoute = require('./api/routes/authenticateNFC');
const resetPinRoute = require('./api/routes/resetPin');
const cancelCardRoute = require('./api/routes/cancelCard');
const createCardRoute = require('./api/routes/createCard');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Prevent CORS violation
app.use(cors());

//Send any requests with authenticateNFC to the correct route
app.use('/authenticateNFC', authenticateRoute);
app.use('/resetPin', resetPinRoute);
app.use('/createCard', createCardRoute);
app.use('/cancelCard', cancelCardRoute);

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