const http = require('http');
const app = require('./app');
const request = require("request");

//Specify port
const port  = process.env.PORT || 3000;

const server = http.createServer(app);

//Starts Server
server.listen(port, () => {
    console.log("Listening on port " + port);
});

// request.get({
//     url: "http://localhost:3000/authenticateNFC",
//     qs: {
//         "cardID": "12345",
//     }},
//     function(err,response,body){
//         console.log(err,body);
//     });
