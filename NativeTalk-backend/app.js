var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config(); // load .env before anything else

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var speakRouter = require('./routes/speak');
var explainRouter = require('./routes/explain');

var app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/speak', speakRouter);
app.use('/explain', explainRouter);

module.exports = app;
