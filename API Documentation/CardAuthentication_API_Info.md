# Merlot Card Authentication API

Card Authentication will provide services for:
* Authenticating a Card
* Creating a Card
* Cancelling a Card
* Resetting a Card's PIN
* Logging
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
{
    status : "Authenticated",
    clientID : clientID
}
OR
{
    status : "NotAuthenticated",
    clientID :"None"
}
```
---

#### Client Accounts System
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
    message : "card created OR card cancelled"
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
        type : "new/deactivate/reset",
        cardnumber : "{{RandomCard}}",
        pin : "{{cardPin}}"
    }
}

var options = { 
    method : "POST",
    url : "http://127.0.0.1:5555",
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
var data = {
  logFile : "auth.txt"
}

var options = { 

};
```
###### Their Response:
```javascript
```
---