const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const authenticateRoutes = require('./api/routes/authenticateNFC');
const resetPinRoutes = require('./api/routes/resetPin');
const cardCreateRoutes = require('./api/routes/cardCreate');
const cardRemoveRoutes = require('./api/routes/cardRemove');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Prevent CORS violation
app.use(cors());

//Send any requests with authenticateNFC to the correct route
app.use('/authenticateNFC', authenticateRoutes);
app.use('/resetPin', resetPinRoutes);
app.use('/cardCreate', cardCreateRoutes);
app.use('/cardRemove', cardRemoveRoutes);

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
