// const authenticate = require('../database/DatabaseConnection')
// const http = require('http');

// const server = http.createServer(async (req, res) => {
//     await authenticate(req, res);
//   });

// const testReq = http.request({
//     method: 'GET',
//     host: 'localhost',
//     path: '/healthz',
//     port: 3000, 
//   }, (res) => {
//     if (res.statusCode === 200) {
//       console.log('Test Passed: Successful authentication returns 200');
//     } else {
//       console.error('Test Failed: Successful authentication should return 200');
//     }
//   });
  
//   testReq.end();

//   server.close(() => {
//     console.log('All tests completed. Server closed.');
//   });

const supertest = require('supertest');
const app = require('../app');

 

var assert = require('assert');

 

describe('Testing our Application', function () {
    it('Simple assert test', function () {
        assert.equal(1, 1);
    });


    it('GET /healthz end point of the application', (done) => {
        supertest(app)
            .get('/healthz')
            .expect(200)
            .end((err, response) => {
                if (err) return done(err)
                else{
                  done()
                  process.exit()
                }
            })
    })
  });