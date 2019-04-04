# Merlot Card Authentication API

Card Authentication will provide services for:
* Authenticating a card
* Creating a card for a client
* Cancelling/De-activating all cards linked to a client
* Logging of all services
---

##### Heroku:
```
https://merlot-card-authentication.herokuapp.com
```
---

#### Authentication System
###### Request:
```javascript
var data = {
    cardID : cardID
}
OR
var data = {
    cardID : cardID,
    pin : PIN
}


var options = {
    hostname : "https://merlot-card-authentication.herokuapp.com",
    port : 3000,
    path : "/authenticateNFC",
    method : "POST",
    body : data,
    headers : {
        "Content-Type" : "application/json",
        "Content-Length" : data.length
    }
 }

```
###### Response:
```javascript
Authenticated:
{
    success : true,
    clientID : clientID,
    message: "Authenticated"
}
                OR

cardID not found OR card de-activated:
{
    success : false,
    clientID : "",
    message: "NotAuthenticated"
}
                OR
                
cardID found but PIN invalid:
{
    success : false,
    clientID : clientID,
    message: "NotAuthenticated"
}
```
---

#### Client Information System
###### Request 
```javascript
var data = {
    clientID : clientID
}

var options = {
    hostname : "https://merlot-card-authentication.herokuapp.com",
    port : 3000,
    path : "/createCard OR /cancelCard",
    method : "POST",
    body : data,
    headers : {
        "Content-Type": "application/json",
        "Content-Length" : data.length
    }
 }
```
###### Response:
```javascript
{
    status : "success",
    message : "card created OR cards cancelled",
}
OR
{
    status :"fail",
    message : "reason for failure"
}
```
---

#### Client Notification System
###### Request 
```javascript
var data = {
    ClientID : "{{ClientID}}",
    Type : "card",
    Content : {
        cardnumber : "{{RandomCard}}",
        pin : "{{cardPin}}"
    }
}

var options = { 
    method : "POST",
    url : "http://merlotnotification.herokuapp.com/",
    headers: {
        "Postman-Token" : "fe00621e-2cbe-4120-83c5-1b340d0b541e",
        "cache-control" : "no-cache",
        "Content-Type" : "application/json"
        
    },
    body : data
};
```
###### Their Response:
```javascript
{
    status : "success",
    timestamp : "2019-03-25T07:50:27.531Z",
    message : "Mail sent successfully"
}
OR
{
    status : "failed",
    timestamp : "2019-03-25T07:50:27.531Z",
    message : "Invalid Notification Type or Missing arguements"
}
```
---

#### Reporting System
###### Request 
```javascript
var postData = querystring.stringify({
	log_set: logData
})

var options = {
	host : "https://still-oasis-34724.herokuapp.com",
	port : 80,
	path : "/uploadLog",
	method : "POST",
	headers : {
	 "Content-Type" : "application/x-www-form-urlencoded",
	 "Content-Length" : Buffer.byteLength(<postData>)
}
```
###### Their Response:
```javascript
text
```
---