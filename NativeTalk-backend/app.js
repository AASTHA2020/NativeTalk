var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config(); // load .env before anything else

var app = express();

// Allow frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var speakRouter = require('./routes/speak');
var explainRouter = require('./routes/explain');
var generateAudioRouter = require('./routes/generate-audio');

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
app.use('/generate-audio', generateAudioRouter);

module.exports = app;
