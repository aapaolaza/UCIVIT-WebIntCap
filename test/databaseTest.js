const assert = require('assert');
const async = require('async');

const mongoDAO = require('../database/mongoDAO.js');

// Always use the test mode for testing
mongoDAO.switchToTestMode();


describe('Database', () => {
  describe('#connectDB()', () => {
    it('should return a valid database connection', (done) => {
      mongoDAO.connectDB((connectErr, db) => {
        if (connectErr) throw connectErr;
        assert.equal(true, db.serverConfig.isConnected(), 'Could not create a connection to the database');
        done();
      });
    });
  });

  describe('#initIndexes()', () => {
    it('should return 13, the number of existing or created indexes', (done) => {
      const indexNumber = 13;
      async.waterfall([
        (asyncCallback) => {
          mongoDAO.dropIndexes((err) => {
            if (err) throw err;
            else {
              asyncCallback(null);
            }
          });
        },
        (asyncCallback) => {
          mongoDAO.initIndexes((err) => {
            if (err) throw err;
            else {
              asyncCallback(null);
            }
          });
        },
        (asyncCallback) => {
          mongoDAO.getIndexList((indexErr, indexInfo) => {
            if (indexErr) throw indexErr;
            else {
              // Test for 12 indexes: 11 indexes created by UCIVIT plus the default _id
              assert.equal(indexNumber, Object.keys(indexInfo).length, 'The number of resulting indexes was different');
              asyncCallback(null);
            }
          });
        },
      ], (err) => {
        if (err) console.log(err);
        done();
      });
    });
  });

  describe('#commitJsonListToEvents(): insert 100', () => {
    it('The retrieved elements should be the same as the inserted ones', (done) => {
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
          // Create some json events
          const jsonList = [];
          const numberOfDocs = 100;
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
          asyncCallback(null, jsonList);
        },
        (jsonList, asyncCallback) => {
          // Insert the created jsonList
          mongoDAO.commitJsonListToEvents(jsonList, (commitErr) => {
            if (commitErr) throw commitErr;
            else {
              asyncCallback(null, jsonList);
            }
          });
        },
        (jsonList, asyncCallback) => {
          // Retrieve inserted events and ensure they are the same
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
            asyncCallback(null);
          });
        },
      ], (err) => {
        if (err) console.log(err);
        done();
      });
    });

    // This test depends on the existence of indexes
    describe('#commitJsonListToEvents(): 2 same events', () => {
      it('It should return an error, and commit only 1 of them', (done) => {
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
            // Create 2 same json events
            const jsonList = [];
            const numberOfDocs = 2;

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
            asyncCallback(null, jsonList);
          },
          (jsonList, asyncCallback) => {
            // insert created events and expect insertion error
            mongoDAO.commitJsonListToEvents(jsonList, (commitErr) => {
              assert(commitErr.message.indexOf('duplicate key error collection') !== -1, 'An error should have occurred');
              asyncCallback(null);
            });
          },
          (asyncCallback) => {
            // Check that one has been inserted successfully
            mongoDAO.findEvents({ test: true }, (queryErr, eventList) => {
              assert.equal(eventList.length, 1, 'One event should have been introduced');
              asyncCallback(null);
            });
          },
        ], (err) => {
          if (err) console.log(err);
          done();
        });
      });
    });
  });

  describe('#closeConnection()', () => {
    it('closes the connection', (done) => {
      mongoDAO.closeConnection((closeErr, isConnected) => {
        assert.equal(false, isConnected);
        done();
      });
    });
  });
});
