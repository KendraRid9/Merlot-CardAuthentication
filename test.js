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
                    res.should.have.status(500); //sent by DBMS, not sure
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
                    res.should.have.status(400); //expected cardID
                });
        });
    });

    describe('Request with one parameter', () => {
        describe('Only cardID', () => {
            it('Valid cardID', () => {
                let body = {
                    "cardID": 1
                };
                
                chai
                .request(host)
                .post(path)
                    .send(body)
                    .end((err, res) => {
                        res.should.have.status(200); //authenticated
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
                    res.should.have.status(404); //cardID not found
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
                        res.should.have.status(400); //expected cardID
                    });
            });
        });
    });
    
    describe('Request with both parameters', () => {
        it('Both valid', () => {
            let body = {
                "cardID": 1,
                "pin": 123
            };
            
            chai
            .request(host)
            .post(path)
            .send(body)
            .end((err, res) => {
                res.should.have.status(200); //authenticated
            });
        });
        
        it('Invalid PIN', () => {
            let body = {
                "cardID": 1,
                "pin": 999
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(404); //PIN invalid
                });
        });

        it('Invalid cardID', () => {
            let body = {
                "cardID": 9999,
                "pin": 999
            };

            chai
                .request(host)
                .post(path)
                .send(body)
                .end((err, res) => {
                    res.should.have.status(404); //PIN invalid
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
                    res.should.have.status(500); //sent by DBMS, not sure
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
                    res.should.have.status(400); //no clientID received
                });
        });
    });
    describe('Request with parameter', () => {
        it('Successful card creation', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(200); //activated
                });
        });

        it('Unsuccessful card creation', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(404); //sent by DBMS, not sure
                });
        });

        describe('Notified Client Notification Subsystem', () => {
            it('Successful notification', () => {
                chai
                    .request(host)
                    .post(path)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                    });
            });

            it('Unsuccessful notification', () => {
                chai
                    .request(host)
                    .post(path)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(400); //invalid syntax
                    });
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
                    res.should.have.status(500); //sent by DBMS, not sure
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
                    res.should.have.status(400);
                });
        });

    });

    describe('Request with parameter', () => {
        it('Valid clientID', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(200); //card cancelled
                });
        });

        it('Invalid clientID', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(404); //no clientID was found
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
                    res.should.have.status(200); //successfully sent
                });
        });

        it('Not successfully sent', () => {
            chai
                .request(host)
                .post(path)
                .send()
                .end((err, res) => {
                    res.should.have.status(400); //not successfully sent
                });
        });
    });
});