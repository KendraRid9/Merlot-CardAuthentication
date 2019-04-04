const chai = require('chai');
//const assert = require('chai').assert;
const app = require('./app');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const host = 'https://merlot-card-authentication.herokuapp.com/'

//Testing for endpoint => authenticateNFC
describe('/authenticateNFC', () => {
    const path = '/authenticateNFC';

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

describe('createCard', () => {

});

describe('authenticateNFC', () => {

});

describe('sendLogs', () => {

});