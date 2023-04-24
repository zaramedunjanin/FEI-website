var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
var flash = require("connect-flash");
var layouts = require('express-ejs-layouts')
var session = require('express-session');
var passport = require('passport');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/administrator');
var presenterRouter = require('./routes/presenter');
var meetingRouter = require('./routes/meeting');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', './layout');

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb',extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(flash());
app.use(session({
  secret: "secret_passcode",
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'strict' }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req,res,next){
  if(req.url === '/' || req.url === '/login' || req.url === '/signup' || req.url==='/meeting/redirect' )
    return next();
  try {
      next();
  }catch (err){
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    res.redirect('/');
  }
});


app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});



app.use('/', indexRouter);
app.use('/administrator', adminRouter);
app.use('/presenter', presenterRouter);
app.use('/meeting', meetingRouter);


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
