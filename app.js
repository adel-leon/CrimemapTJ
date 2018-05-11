var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
const mongoose = require('mongoose');

//mongodb connection
var uri = "mongodb://crimemap:VIETNAM26@ds211440.mlab.com:11440/delitos"
mongoose.Promise = global.Promise;
mongoose.connect(uri)
//mongodb+srv://Crimemap:VIETNAM26@incidencia-delictiva-skgz6.mongodb.net/delitos
  .then(() => {
      console.log("Successfully connected to the database");    
  }).catch(err => {
      console.log('Could not connect to the database. Exiting now...');
      process.exit();
});
require('./api/models/apiModel');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// express setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.options('*', cors());

// routers
var indexRouter = require('./routes/index');
var APIRouter = require('./api/routes/apiRoutes');

app.use('/', indexRouter);
app.use('/API', APIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
