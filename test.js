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

// describe('/createCard', () => {
//     const path = '/createCard';

//     describe('Database connection error', () => {
//         it('Failed connection', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("7: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //sent by DBMS, not sure
//                 });
//         });
//     });

//     describe('Request with no parameter', () => {
//         it('Empty request', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("8: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //no clientID received
//                 });
//         });
//     });
//     describe('Request with parameter', () => {
//         it('Successful card creation', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("9: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //activated
//                 });
//         });

//         it('Unsuccessful card creation', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("10: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //sent by DBMS, not sure
//                 });
//         });

//         describe('Notified Client Notification Subsystem', () => {
//             it('Successful notification', () => {
//                 chai
//                     .request(host)
//                     .post(path)
//                     .send()
//                     .end((err, res) => {
//                         console.log("11: " + res.body);
//                         res.body.should.be.eql("");
//                         // res.should.have.status(200);
//                     });
//             });

//             it('Unsuccessful notification', () => {
//                 chai
//                     .request(host)
//                     .post(path)
//                     .send()
//                     .end((err, res) => {
//                         console.log("12: " + res.body);
//                         res.body.should.be.eql("");
//                         // res.should.have.status(200); //invalid syntax
//                     });
//             });
//         });
//     });
// });

// describe('/cancelCard', () => {
//     const path ='/cancelCard';

//     describe('Database connection error', () => {
//         it('Failed connection', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("13: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //sent by DBMS, not sure
//                 });
//         });
//     });

//     describe('Request with no parameter', () => {
//         it('Empty request', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("14: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200);
//                 });
//         });

//     });

//     describe('Request with parameter', () => {
//         it('Valid clientID', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("15: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //card cancelled
//                 });
//         });

//         it('Invalid clientID', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("16: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //no clientID was found
//                 });
//         });
//     });
// });

// describe('/sendLogs', () => {
//     const path = '/sendLogs';

//     describe('Send logs to Reporting Subsystem', () => {
//         it('Successfully sent', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("17: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //successfully sent
//                 });
//         });

//         it('Not successfully sent', () => {
//             chai
//                 .request(host)
//                 .post(path)
//                 .send()
//                 .end((err, res) => {
//                     console.log("18: " + res.body);
//                     res.body.should.be.eql("");
//                     // res.should.have.status(200); //not successfully sent
//                 });
//         });
//     });
// });