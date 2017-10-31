const fs = require('fs');
const assert = require('assert');
const async = require('async');
const chai = require('chai');
const chaiHttp = require('chai-http');
const md5 = require('md5');
const server = require('../ucivitServer');
const mongoDAO = require('../database/mongoDAO.js');

// Always use the test mode for testing
mongoDAO.switchToTestMode();

// configure chai for requests
chai.should();
chai.use(chaiHttp);


const binaryParser = (res, cb) => {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', (chunk) => {
    res.data += chunk;
  });
  res.on('end', () => {
    cb(null, new Buffer.from(res.data, 'binary'));
  });
};

describe('Event server', () => {
  describe('#ucivitTime()', () => {
    it('should return a EPOCH timestamp in ms corresponding to today', (done) => {
      chai.request(server)
        .get('/ucivitTime')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('serverTime');

          const serverTime = new Date(parseInt(res.body.serverTime, 10));
          assert.equal(serverTime.toDateString(), new Date().toDateString());

          done();
        });
    });
  });

  describe('#ucivitScript()', () => {
    it('should return the exact same file ucivit.js as located in the public folder', (done) => {
      chai.request(server)
        .get('/ucivit.js')
        .buffer()
        .parse(binaryParser)
        .end((reqParseErr, res) => {
          if (reqParseErr) throw reqParseErr;
          res.should.have.status(200);

          fs.readFile('./public/ucivit.js', (fileReadErr, data) => {
            if (fileReadErr) throw fileReadErr;
            assert.equal(md5(res.body), md5(data.toString()));
            done();
          });
        });
    });
  });
  describe('#test()', () => {
    it('should return the exact same file webpage_example.html as located in the public folder', (done) => {
      chai.request(server)
        .get('/test')
        .buffer()
        .parse(binaryParser)
        .end((reqParseErr, res) => {
          if (reqParseErr) throw reqParseErr;
          res.should.have.status(200);

          fs.readFile('./public/webpage_example.html', (fileReadErr, data) => {
            if (fileReadErr) throw fileReadErr;
            assert.equal(md5(res.body), md5(data.toString()));
            done();
          });
        });
    });
  });

  describe('#logEvent()', () => {
    it('should store the provided list of json events', (done) => {
      async.waterfall([
        (asyncCallback) => {
          // Delete previously existing test events
          mongoDAO.purgeTestEvents((purgeErr, deletedCount) => {
            if (purgeErr) throw purgeErr;
            else {
              console.log(`${deletedCount} documents were deleted`);
              asyncCallback(null);
            }
          });
        },
        (asyncCallback) => {
          const jsonList = [];
          const numberOfDocs = 100;
          // Create some json events
          for (let i = 0; i < numberOfDocs; i += 1) {
            jsonList.push({
              event: 'testevent',
              sid: 'testUser',
              sd: 'testPage',
              url: 'testpage.com',
              timestampms: i * 1000,
              sessionstartms: Math.round(i) * 1000,
              episodeCount: Math.round(i),
              test: true,
            });
          }
          const userID = 'testUser';
          const lastEventTS = numberOfDocs * 1000;
          asyncCallback(null, jsonList, userID, lastEventTS);
        },
        (jsonList, userID, lastEventTS, asyncCallback) => {
          chai.request(server)
            .post('/log/event')
            .send({ userID, lastEventTS, jsonLogString: JSON.stringify(jsonList) })
            .end((reqParseErr, res) => {
              if (reqParseErr) throw reqParseErr;
              res.should.have.status(200);
              asyncCallback(null, jsonList);
            });
        },

        (jsonList, asyncCallback) => {
          mongoDAO.findEvents({ test: true }, (queryErr, eventList) => {
            if (queryErr) throw queryErr;
            let i = 0;
            eventList.forEach((eventDoc) => {
              // remove the database id field before comparison
              delete eventDoc._id;
              assert.deepEqual(jsonList[i], eventDoc, 'An inserted document was different');
              i += 1;
            });
            asyncCallback(null);
          });
        },
      ], (err) => {
        if (err) console.log(err);
        done();
      });
    });
  });

  describe('#stressLogEvent()', () => {
    it('should store the events from all requests', (done) => {
      async.waterfall([
        (asyncCallback) => {
          // Delete previously existing test events
          mongoDAO.purgeTestEvents((purgeErr, deletedCount) => {
            if (purgeErr) throw purgeErr;
            else {
              console.log(`${deletedCount} documents were deleted`);
              asyncCallback(null);
            }
          });
        },
        (asyncCallback) => {
          const requestList = [];
          const numberOfRequests = 100;
          const numberOfDocs = 100;
          for (let reqIndex = 0; reqIndex < numberOfRequests; reqIndex += 1) {
            requestList[reqIndex] = {};
            requestList[reqIndex].jsonList = [];
            requestList[reqIndex].userID = `testUser${reqIndex}`;
            requestList[reqIndex].lastEventTS = (numberOfDocs * 1000) + reqIndex;
            // Create some json events
            for (let i = 0; i < numberOfDocs; i += 1) {
              requestList[reqIndex].jsonList.push({
                event: 'testevent',
                sid: `testUser${reqIndex}`,
                sd: 'testPage',
                url: 'testpage.com',
                timestampms: i * 1000,
                sessionstartms: Math.round(i) * 1000,
                episodeCount: Math.round(i),
                test: true,
                random: Math.random() * 100,
              });
            }
          }
          asyncCallback(null, requestList);
        },
        (requestList, asyncCallback) => {
          async.each(requestList, (request, asyncEachCallback) => {
            chai.request(server)
              .post('/log/event')
              .send({
                jsonLogString: JSON.stringify(request.jsonList),
              })
              .end((reqParseErr, res) => {
                if (reqParseErr) throw reqParseErr;
                res.should.have.status(200);
                asyncEachCallback(null);
              });
          }, (err) => {
            if (err) throw err;
            else asyncCallback(null, requestList);
          });
        },
        (requestList, asyncCallback) => {
          async.each(requestList, (request, asyncEachCallback) => {
            mongoDAO.findEvents({ test: true, sid: request.userID }, (queryErr, eventList) => {
              if (queryErr) throw queryErr;
              let i = 0;
              eventList.forEach((eventDoc) => {
                // remove the database id field before comparison
                delete eventDoc._id;
                assert.deepEqual(request.jsonList[i], eventDoc, 'An inserted document was different');
                if (JSON.stringify(request.jsonList[i]) !== JSON.stringify(eventDoc)) console.log('ERROR');
                i += 1;
              });
              asyncEachCallback(null);
            });
          }, (err) => {
            if (err) throw err;
            else asyncCallback(null);
          });
        },
      ], (waterfallErr) => {
        if (waterfallErr) console.log(waterfallErr);
        done();
        // TODO: For some reason the testing hangs after running if all tests passed. Force exit
        process.exit();
      });
    }).timeout(10000);// In case it takes longer than 2 secs
  });
});
