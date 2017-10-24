const mongodb = require('mongodb');
const async = require('async');
const dateFormat = require('dateformat');

const { eventFields } = require('./constants');

const mongoClient = mongodb.MongoClient;

const {
  mongoPath, mongoTestPath, mongoAuthenticateDB, mongoUser, mongoPass,
} = require('./dbAccessData');

const eventCollName = 'events';
let globalDbConnection = null;
const mongoTimeout = 0;
let isTestMode = false;

/**
 * Creates a new connection to the database. If isTestMode, the
 * mongoTestPath will be used to connect
 * @param {*} callback
 */
function createNewConnection(callback) {
  let mongoConnectionPath = mongoPath;
  if (isTestMode) mongoConnectionPath = mongoTestPath;

  // For authentication we add the parameter to the mongoPath
  // From http://mongodb.github.io/node-mongodb-native/2.0/tutorials/connecting/
  // Authentication > Indirectly Against Another Database
  if (mongoUser !== '' && mongoUser !== 'DBUSERNAME') {
    mongoConnectionPath = `${mongoUser}:${mongoPass}@${mongoPath}?authSource=${mongoAuthenticateDB}`;
    if (isTestMode) mongoConnectionPath = `${mongoUser}:${mongoPass}@${mongoTestPath}?authSource=${mongoAuthenticateDB}`;
  }

  const options = {
    keepAlive: mongoTimeout,
    connectTimeoutMS: mongoTimeout,
    socketTimeoutMS: mongoTimeout,
  };

  // Open the connection to the server
  mongoClient.connect(`mongodb://${mongoConnectionPath}`, options, (err, dbConnection) => {
    if (err) { callback(err, null); }
    globalDbConnection = dbConnection;
    callback(err, dbConnection);
  });
}


/**
 * Connect to the mongoDB and authenticate (if necessary).
 * If a connection already exists, return it.
 */
function connectDB(callback) {
  // var mongoclient = new MongoClient(new Server(mongoPath), {native_parser: true});
  // globalDbConnection=null;
  if (globalDbConnection && globalDbConnection.serverConfig.isConnected()) {
    callback(null, globalDbConnection);
  } else {
    createNewConnection(callback);
  }
}

/**
 * Connect to the mongoDB in TEST mode and authenticate (if necessary).
 * If a connection already exists, return it.
 */
function switchToTestMode() {
  isTestMode = true;
}

function closeConnection(callback) {
  if (globalDbConnection) {
    globalDbConnection.close();
    callback(null, globalDbConnection.serverConfig.isConnected());
  }
}

/**
 * Initialises indexes for the database
 * Returns an error if any of the indexes fail
 */
function initIndexes(callback) {
  const indexObjectList = [
    { [eventFields.SID]: 1 },
    { [eventFields.SD]: 1 },
    { [eventFields.EVENT]: 1 },
    { [eventFields.TIMESTAMPMS]: 1 },
    { [eventFields.URL]: 1 },
    { [eventFields.SID]: 1, [eventFields.URL]: 1 },
    { [eventFields.SID]: 1, [eventFields.SD]: 1 },
    { [eventFields.SID]: 1, [eventFields.EPISODECOUNT]: 1 },
    { [eventFields.SID]: 1, [eventFields.URL]: 1, [eventFields.TIMESTAMPMS]: 1 },
    { [eventFields.SID]: 1, [eventFields.URL]: 1, [eventFields.EPISODECOUNT]: 1 },
  ];

  const uniqueIndex = {
    [eventFields.SID]: 1,
    [eventFields.SD]: 1,
    [eventFields.SESSIONSTARTMS]: 1,
    [eventFields.EVENT]: 1,
    [eventFields.TIMESTAMPMS]: 1,
  };

  connectDB((connectErr, db) => {
    if (connectErr) callback(connectErr);

    async.each(indexObjectList, (indexObject, asyncCallback) => {
      db.collection(eventCollName).createIndex(indexObject, (err) => {
        if (err) {
          asyncCallback(err);
        } else {
          asyncCallback(null);
        }
      });
    }, (err) => {
      if (err) {
        callback(err);
      } else {
        db.collection(eventCollName).createIndex(
          uniqueIndex, { unique: true },
          (uniqueIndexErr) => {
            if (uniqueIndexErr) {
              callback(uniqueIndexErr);
            } else {
              callback(null);
            }
          });
      }
    });
  });
}

function getIndexList(callback) {
  connectDB((connectErr, db) => {
    if (connectErr) callback(connectErr);
    db.collection(eventCollName)
      .indexInformation((indexErr, indexInfo) => {
        callback(indexErr, indexInfo);
      });
  });
}

/**
 * Tests if the json to be inserted is valid
 * @param {*} jsonDocList
 * @param {*} callback
 */
function validateJsonList(jsonDocList, callback) {
  callback(null, true);
}

/**
 * Given a json document, it introduces its content to the database
 * @param {JSON} jsonDocList list
 * @param {*} callback
 */
function commitJsonListToEvents(jsonDocList, callback) {
  async.waterfall([
    (asyncCallback) => {
      // validate json before inserting it to the database
      validateJsonList(jsonDocList, (err, isJsonValid) => {
        if (err || !isJsonValid) {
          asyncCallback('ERROR Json could not be validated');
        } else {
          asyncCallback(null);
        }
      });
    },
    (asyncCallback) => {
      // The waterfall will only get here if the json is valid
      connectDB((connectErr, db) => {
        if (connectErr) asyncCallback(connectErr);
        db.collection(eventCollName).insertMany(jsonDocList, (insertErr, insertResults) => {
          // console.log(`inserted ${insertResults.insertedCount} results`);
          asyncCallback(insertErr);
        });
      });
    },
  ], (err) => {
    if (err) console.log(err);
    callback(err);
  });
}

/**
 * returns the list of all documents in the database
 * @param {Object} options for the search
 * @param {*} callback
 */
function findEvents(options, callback) {
  connectDB((connectErr, db) => {
    if (connectErr) callback(connectErr);
    else {
      db.collection(eventCollName).find(options).toArray((findErr, docList) => {
        if (findErr) callback(findErr);
        else callback(null, docList);
      });
    }
  });
}

// TODO: write a function that deletes all "test" events

/**
 * Deletes all "test events". Returns the number of deleted events
 * @param {*} callback
 */
function purgeTestEvents(callback) {
  connectDB((connectErr, db) => {
    if (connectErr) callback(connectErr);
    else {
      db.collection(eventCollName).deleteMany({ test: true }, (deleteErr, deleteObj) => {
        if (deleteErr) callback(deleteErr);
        else callback(null, deleteObj.result.n);
      });
    }
  });
}

/**
 * Returns the timestamp (long ms) of the last event recorded for that user
 * @param String ID for the user to request the timestamp for
 *
 * @return long timestamp value in ms, "0" if there is any error
 */
function getLastEventTimestampForUser(sid, callback) {
  db.collection(eventCollName).find({ sid }).sort([eventFields.TIMESTAMPMS]).limit(1)
    .toArray((findErr, result) => {
      if (findErr) callback(findErr);
      const dateObj = new Date(result[eventFields.TIMESTAMPMS]);
      callback(null, dateFormat(dateObj, 'yyyy-mm-dd,HH:MM:ss:lll'));
    });
}

module.exports.connectDB = connectDB;
module.exports.switchToTestMode = switchToTestMode;
module.exports.closeConnection = closeConnection;
module.exports.initIndexes = initIndexes;
module.exports.getIndexList = getIndexList;
module.exports.commitJsonListToEvents = commitJsonListToEvents;
module.exports.findEvents = findEvents;
module.exports.purgeTestEvents = purgeTestEvents;
module.exports.getLastEventTimestampForUser = getLastEventTimestampForUser;
