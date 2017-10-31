// Load libraries
const express = require('express');
const bodyParser = require('body-parser');
const ucivitOptions = require('./options');
const mongoDAO = require('./database/mongoDAO.js');

// Start Express server
const app = express();
// Using a body parse is necessary so Express retrieves the POST information
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Returns the current timestamp of the server
app.all('/ucivitTime', (req, res) => {
  // console.log('request: time');
  res.jsonp({ serverTime: `${new Date().getTime()}` });
});

app.all('/ucivit.js', (req, res) => {
  // console.log('request: client script');
  res.sendFile(`${__dirname}/public/ucivit.js`);
});

app.all('/test', (req, res) => {
  res.sendFile(`${__dirname}/public/webpage_example.html`);
});

app.all('/log/event', (req, res) => {
  /**
   * Depending on the domain where the server is located
   * the received data will be sent via GET or POST
   * (req.query for GET, req.body for POST)
   */
  let { jsonLogString } = req.body;
  if (typeof jsonLogString === 'undefined') {
    ({ jsonLogString } = req.query);
  }

  // console.log(`Logging ${JSON.parse(jsonLogString).length} events`);
  if (typeof jsonLogString === 'undefined'
    || JSON.parse(jsonLogString).length === 0) {
    console.log('invalid data');
    res.status(500).jsonp({ err: 'invalid data' });
  } else {
    mongoDAO.commitJsonListToEvents(JSON.parse(jsonLogString), (commitErr) => {
      if (commitErr) {
        res.status(500).jsonp({ err: commitErr });
      } else {
        res.status(200).jsonp({ success: true });// return a valid JSON or null for success
      }
    });
  }
});

/**
 * log/dom request can only contain a single json document with full DOM data
 */
app.all('/log/dom', (req, res) => {
  let { jsonDomData } = req.body;
  if (typeof jsonDomData === 'undefined') {
    ({ jsonDomData } = req.query);
  }
  // console.log(`Logging ${JSON.parse(jsonLogString).length} events`);
  if (typeof jsonDomData === 'undefined'
    || JSON.parse(jsonDomData).length === 0) {
    console.log('invalid data');
    res.status(500).jsonp({ err: 'invalid data' });
  } else {
    mongoDAO.commitDomContent(JSON.parse(jsonDomData), (commitErr) => {
      if (commitErr) {
        console.log(commitErr);
        res.status(500).jsonp({ err: commitErr });
      } else {
        res.status(200).jsonp({ success: true });// return a valid JSON or null for success
      }
    });
  }
});


const server = app.listen(ucivitOptions.port, ucivitOptions.bindIP, () => {
  console.log(`UCIVIT Server running on ${ucivitOptions.port} and address ${ucivitOptions.bindIP} ...`);
});


/**
 * Error handling
 */
process.stdin.resume();// so the program will not close instantly

function exitHandler(options, err) {
  if (options.adminInitiated) {
    console.log(500, 'ADMINISTRATOR STOPPED THE SERVER');
  } else {
    console.log(500, 'FATAL ERROR, CONTACT ADMINISTRATOR');
  }
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}


// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { adminInitiated: true, exit: true }));

// catches uncaught exceptions
// Do we want to close the server if there is an uncaught exception?
process.on('uncaughtException', exitHandler.bind(null, { exit: false }));

module.exports = server;
