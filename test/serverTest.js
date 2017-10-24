const fs = require('fs');
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const md5 = require('md5');
const server = require('../server');
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
  describe('GET ucivitTime()', () => {
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

  describe('ucivit.js', () => {
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
  describe('test', () => {
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
  describe('log event', () => {
    it('should store the provided list of json events', (done) => {
      // TODO: create a request to store hundreds of events
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

      mongoDAO.purgeTestEvents((purgeErr, deletedCount) => {
        if (purgeErr) throw purgeErr;
        else {
          console.log(`${deletedCount} documents were deleted`);

          chai.request(server)
            .post('/log')
            .send({ userID, lastEventTS, jsonLogString: JSON.stringify(jsonList) })
            .end((reqParseErr, res) => {
              if (reqParseErr) throw reqParseErr;
              res.should.have.status(200);

              mongoDAO.findEvents({ test: true }, (queryErr, eventList) => {
                if (queryErr) throw queryErr;
                let i = 0;
                eventList.array.forEach((eventDoc) => {
                  // remove the database id field before comparison
                  delete eventDoc._id;
                  assert.deepEqual(jsonList[i], eventDoc);
                  i += 1;
                });
                done();
              });
            });
        }
      });
    });
  });
});
