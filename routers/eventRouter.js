const express = require('express');
const mongoDAO = require('../database/mongoDAO.js');

const router = express.Router();

// middleware that is specific to this router
/* router.use((req, res, next) => {
  console.log('Wevquery router Time: ', Date.now());
  next();
});
*/

// Handles requests to store data. ALL information is stored in the POST
router.route('/log')
  .get((req, res) => {
    console.log('Store event request received');
    res.sendStatus(200);
    //console.log(req);
    const { userId, eventJson } = req.query;
    if (!userId || !eventJson) {
      console.log('invalid data');
      res.sendStatus(500);
    } else {
      mongoDAO.commitJsonListToEvents(eventJson, (commitErr) => {
        if (commitErr) {
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });

router.route('/ucivitTime')
  .get((req, res) => {
    console.log('request: time');
    res.jsonp({ serverTime: `${new Date().getTime()}` });
  });


router.route('/logTest')
  .get((req, res) => {
    console.log('request:logTEST');
    res.jsonp({ serverTime: `${new Date().getTime()}` });
  });

module.exports = router;
