const chai = require('chai');
//const assert = require('chai').assert;
const app = require('./app');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const host = 'https://merlot-card-authentication.herokuapp.com'

//Testing for endpoint => authenticateNFC
describe('/authenticateNFC', () => {
    const path = '/authenticateNFC';

    describe('Database connection error', () => {
        it('Failed connection', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.deep.eql({
                        Success: 'false',
                        ClientID: '',
                        Message: 'Expected cardID'
                    }); //sent by DBMS, not sure
                });
        });
    });

    describe('Request with no parameters', () => {
        it('Empty request', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.eql({
                        Success: 'false',
                        ClientID: '',
                        Message: 'Expected cardID'
                    });
                });
        });
    });

    describe('Request with one parameter', () => {
        describe('Only cardID', () => {
            it('Valid cardID', () => {
                let body = {
                    "cardID": 200
                };
                
                chai
                .request(host)
                .post(path)
                    .send(body)
                    .end((err, res) => {
                        res.body.should.be.eql({
                            Success:"false",
                            ClientID:"",
                            Message:"card deactivated"
                        });
                    });
            });
            
            it('Invalid cardID', () => {
                let body = {
                    "cardID": 9999
                };
                
                chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        Success:"false",
                        ClientID:"",
                        Message:"cardID not found"
                    });
                });
            });
            
        });

        describe('Only PIN', () => {
            it('Invalid scenario', () => {
                let body = {
                    "pin": 123
                };
    
                chai
                    .request(host)
                    .post(path)
                    .send(body)
                    .end((err, res) => {
                        res.body.should.be.eql({
                            Success: false,
                            ClientID: "",
                            Message: "We messed up somewhere, and we don't know why. You should honestly not be getting this error. Sorry."
                        });
                    });
            });
        });
    });
        

    describe('Request with both parameters', () => {
        it('Both valid', () => {
            let body = {
                "cardID": "418",
                "pin": "9030"
            };
            
            chai
            .request(host)
            .post(path)
            .send(body)
            .end((err, res) => {
                res.body.should.be.eql({
                    Success: "true",
                    ClientID: 8,
                    Message: "authenticated"
                });
            });
        });

        it('Invalid PIN', () => {
            let body = {
                "cardID": "418",
                "pin": "1234"
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        Success: "false",
                        ClientID: 8,
                        Message: "pin invalid"
                    });
                });
        });

        it('Invalid cardID', () => {
            let body = {
                "cardID": "9999",
                "pin": "1234"
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({"Success":"false","ClientID":"","Message":"cardID not found"});
                });
        });

        it('Deactivated card', () => {
            let body = {
                "cardID": "200",
                "pin": "1234"
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        Success: "false",
                        ClientID: "",
                        Message: "card deactivated"
                    });
                });
        });
    });
});

describe('/createCard', () => {
    const path = '/createCard';

    describe('Database connection error', () => {
        it('Failed connection', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.deep.eql({
                        status: "fail",
                        message: "no clientID received"
                    }); //sent by DBMS, not sure
                });
        });
    });

    describe('Request with no parameter', () => {
        it('Empty request', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.eql({
                        status: "fail",
                        message: "no clientID received"
                    });
                });
        });
    });

    describe('Request with parameter', () => { //TODO
        it('Successful card creation', () => {
            let body = {
                "clientID": "6" //I'm gonna regret putting my own clientID here, my emails are getting spammed
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        status: "success",
                        message: "card created",
                        notifyClient: "success"
                    });
                    //IF NOTIFICATION SUBSYS GOES DOWN:
                    //{
                    //     status: "success",
                    //     message: "card created",
                    //     notifyClient: false
                    // }

                    //IF THEY STAY UP:
                    //{
                    //     status: "success",
                    //     message: "card created",
                    //     notifyClient: "success"
                    // }
                });
        });

        it('Unsuccessful card creation', () => {
            let body = {
                "clientID": ""
            };

            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.eql({
                        status: "fail",
                        message: "no clientID received"
                    });
                });
        });
    });

    describe('Notified Client Notification Subsystem', () => {
        it('Successful notification', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(200); //If we've gotten a 200 response from them, they received it
                });
        });

        it('Unsuccessful notification', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(200); //If we've gotten a 404 response from them, they didn't receive it
                });
        });
    });
});

describe('/cancelCard', () => {
    const path ='/cancelCard';

    describe('Database connection error', () => {
        it('Failed connection', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.eql({
                        message: "No clientID was found"
                    });
                });
        });
    });

    describe('Request with no parameter', () => {
        it('Empty request', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.body.should.be.eql({
                        message: "No clientID was found"
                    });
                });
        });

    });

    describe('Request with parameter', () => {
        it('Valid clientID', () => {
            let body = {
                "clientID": "13"
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        status: "success",
                        message: "cards cancelled"
                    });
                });
        });

        it('Invalid clientID', () => {
            let body = {
                "clientID": "999999"
            };
            
            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.body.should.be.eql({
                        status: "fail",
                        message: "client not found in database"
                    });
                });
        });
    });
});

describe('/sendLogs', () => {
    const path = '/sendLogs';

    describe('Send logs to Reporting Subsystem', () => {
        it('Successfully sent', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.status.should.be.eql(200);
                });
        });

        it('Not successfully sent', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.status.should.be.eql(200);
                });
        });
    });
});