const express = require('express');
const mongoDAO = require('../database/mongoDAO.js');

const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Wevquery router Time: ', Date.now());
  next();
});


// Handles requests to store data. ALL information is stored in the POST
router.route('/storeevent/')
  .get((req, res) => {
    const { userId, eventJson } = req.query;
    if (!userId || !eventJson) {
      res.send(500);
    } else {
      mongoDAO.commitJsonToEvents(eventJson, (commitErr) => {
        if (commitErr) {
          res.send(500);
        } else {
          res.send(200);
        }
      });
    }
  });
