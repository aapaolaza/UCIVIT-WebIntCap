// Load libraries
const express = require('express');


// Start Express server
const app = express();

const eventRouter = require('./routers/eventRouter');

app.use('/eventrouter', eventRouter);
