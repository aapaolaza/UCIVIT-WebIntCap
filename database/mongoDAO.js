const mongodb = require('mongodb');
const async = require('async');
const dateFormat = require('dateformat');

const eventFields = require('./constants').eventFields;

const mongoClient = mongodb.MongoClient;

const {
  mongoPath, mongoAuthenticateDB, mongoQueryDB, mongoUser, mongoPass,
} = require('./dbAccessData');

const eventCollName = 'events';
let globalDbConnection = null;
const mongoTimeout = 0;

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


function createNewConnection(callback) {
  let mongoConnectionPath = mongoPath;
  // For authentication we add the parameter to the mongoPath
  // From http://mongodb.github.io/node-mongodb-native/2.0/tutorials/connecting/
  // Authentication > Indirectly Against Another Database
  if (mongoUser !== '' && mongoUser !== 'DBUSERNAME') {
    mongoConnectionPath = `${mongoUser}:${mongoPass}@${mongoPath}?authSource=${mongoAuthenticateDB}`;
  }

  const options = {
    server: {
      socketOptions: {
        keepAlive: mongoTimeout,
        connectTimeoutMS: mongoTimeout,
        socketTimeoutMS: mongoTimeout,
      },
    },
    replset: {
      socketOptions: {
        keepAlive: mongoTimeout,
        connectTimeoutMS: mongoTimeout,
        socketTimeoutMS: mongoTimeout,
      },
    },
  };

  // Open the connection to the server
  mongoClient.connect(`mongodb://${mongoConnectionPath}`, options, (err, dbConnection) => {
    if (err) { callback(err, null); }
    globalDbConnection = dbConnection;
    callback(err, dbConnection);
  });
}

function closeConnection() {
  if (globalDbConnection) globalDbConnection.close();
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
    { [eventFields.TIMESTAMP]: 1 },
    { [eventFields.TIMESTAMPMS]: 1 },
    { [eventFields.URL]: 1 },
    { [eventFields.SID]: 1, [eventFields.URL]: 1 },
    { [eventFields.SID]: 1, [eventFields.SD]: 1 },
    { [eventFields.SID]: 1, [eventFields.EPISODECOUNT]: 1 },
    { [eventFields.SID]: 1, [eventFields.URL]: 1, [eventFields.EPISODECOUNT]: 1 },
  ];

  const uniqueIndex = {
    [eventFields.SID]: 1,
    [eventFields.SD]: 1,
    [eventFields.SESSIONSTARTMS]: 1,
    [eventFields.EVENT]: 1,
    [eventFields.TIMESTAMPMS]: 1,
  };

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
      db.collection(eventCollName).createIndex(uniqueIndex, { unique: true },
        (uniqueIndexErr) => {
          if (uniqueIndexErr) {
            callback(uniqueIndexErr);
          } else {
            callback(null);
          }
        });
    }
  });
}

/**
 * Tests if the json to be inserted is valid
 * @param {*} jsonDoc
 * @param {*} callback
 */
function validateJson(jsonDoc, callback) {
  callback(null, true);
}

/**
 * Given a json document, it introduces its content to the database
 * @param {JSON} jsonDoc
 * @param {*} callback
 */
function commitJsonToEvents(jsonDoc, callback) {
  async.waterfall([
    (asyncCallback) => {
      // validate json before inserting it to the database
      validateJson(jsonDoc, (err, isJsonValid) => {
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
        db.collection(eventCollName).eventsColl.insertOne(jsonDoc, (insertErr) => {
          asyncCallback(insertErr);
        });
      });
    },
  ], (err) => {
    callback(err);
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


module.exports.commitJsonToEvents = commitJsonToEvents;
module.exports.getLastEventTimestampForUser = getLastEventTimestampForUser;
