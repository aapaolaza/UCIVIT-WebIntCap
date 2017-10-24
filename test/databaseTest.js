const assert = require('assert');
const mongoDAO = require('../database/mongoDAO.js');

// Always use the test mode for testing
mongoDAO.switchToTestMode();


describe('Database', () => {
  describe('connectDB()', () => {
    it('should return a valid database connection', (done) => {
      mongoDAO.connectDB((connectErr, db) => {
        if (connectErr) throw connectErr;
        assert.equal(true, db.serverConfig.isConnected(), 'Could not create a connection to the database');
        done();
      });
    });
  });

  describe('initIndexes()', () => {
    it('should return 12, the number of existing or created indexes', (done) => {
      mongoDAO.initIndexes((err) => {
        if (err) throw err;
        else {
          mongoDAO.getIndexList((indexErr, indexInfo) => {
            if (indexErr) throw indexErr;
            else {
              // Test for 12 indexes: 11 indexes created by UCIVIT plus the default _id
              assert.equal(12, Object.keys(indexInfo).length, 'The number of resulting indexes was different');
              done();
            }
          });
        }
      });
    });
  });

  describe.only('commitJsonListToEvents(): insert 100', () => {
    it('The retrieved elements should be the same as the inserted ones', (done) => {
      const jsonList = [];
      const jsonListTest = [];
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
        jsonListTest.push({
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

      mongoDAO.purgeTestEvents((purgeErr, deletedCount) => {
        if (purgeErr) throw purgeErr;
        else {
          console.log(`${deletedCount} documents were deleted`);

          mongoDAO.commitJsonListToEvents(jsonList, (commitErr) => {
            if (commitErr) throw commitErr;
            else {
              mongoDAO.findEvents({ test: true }, (queryErr, eventList) => {
                if (queryErr) throw queryErr;
                let i = 0;
                eventList.forEach((eventDoc) => {
                  /* 'If the document passed to the insertOne method does not contain
                  the _id field, the driver automatically adds the field to the
                  document and sets the field’s value to a generated ObjectId'
                  So there is no need to remove the ID from the db document for
                  comparison */
                  assert.deepEqual(jsonList[i], eventDoc, 'An inserted document was different');

                  i += 1;
                });
                done();
              });
            }
          });
        }
      });
    });
  });

  describe('commitJsonListToEvents(): 2 same events', () => {
    it('It should return an error, and not commit them', (done) => {
      const jsonList = [];
      const numberOfDocs = 2;
      // Create some json events
      for (let i = 0; i < numberOfDocs; i += 1) {
        jsonList.push({
          event: 'testevent',
          sid: 'testUser',
          sd: 'testPage',
          url: 'testpage.com',
          timestampms: 1000,
          sessionstartms: 1000,
          episodeCount: i,
          test: true,
        });
      }

      mongoDAO.commitJsonListToEvents(jsonList, (commitErr) => {
        // TODO: Design a test that checks for the returned error
        assert.throws(commitErr, /Email is required/);
        done();
      });
    });
  });

  describe('closeConnection()', () => {
    it('closes the connection', (done) => {
      mongoDAO.closeConnection((closeErr, isConnected) => {
        assert.equal(false, isConnected);
        done();
      });
    });
  });
});
