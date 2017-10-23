const assert = require('assert');
const mongoDAO = require('../database/mongoDAO.js');

describe('Database', () => {
  describe('connectDB()', () => {
    it('should return a valid database connection', (done) => {
      mongoDAO.connectDB((connectErr, db) => {
        if (connectErr) throw connectErr;
        assert.equal(true, db.serverConfig.isConnected());
        done();
      });
    });
  });
  describe('initIndexes()', () => {
    it('should return the number of existing or created indexes', (done) => {
      mongoDAO.initIndexes((err) => {
        if (err) throw err;
        else {
          mongoDAO.getIndexList((indexErr, indexInfo) => {
            if (indexErr) throw indexErr;
            else {
              // 12 indexes created by UCIVIT plus the default _id
              assert.equal(13, Object.keys(indexInfo).length);
              done();
            }
          });
        }
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
