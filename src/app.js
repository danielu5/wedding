const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const guestsRouter = require('./routes/guests');
const groupsRouter = require('./routes/groups');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/guests', guestsRouter);
app.use('/api/groups', groupsRouter);


module.exports = app;
