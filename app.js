var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var routes = index.routes;
var db = index.db;
var users = require('./routes/users');

var session = require('express-session');
var NedbStore = require('connect-nedb-session')(session);

var webRTC = require('webrtc.io').listen(8001);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var flash = require('connect-flash');

var bcrypt = require('bcrypt-nodejs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// nedb session
app.use(session({
  key: 'e_session',
  secret: 'aiekfl3o39f@%#$adfk2',
  resave: false,
  saveUninitialized: false,
  cookie: {path: '/',
           httpOnly: true},
  store: new NedbStore({filename: 'data/sessions.db'})
}));

app.use(flash());
// passport for login
app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// passport configurations related to routes/index
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done) {
    var data = {
      id: username
    };
    db.find(data, function(err, docs) {
      if(err) {
        return done(err);
      }
      if(docs[0]) {
        if(bcrypt.compareSync(password, docs[0].password) === false) {
          return done(null, false, req.flash('message', 'Invalid password.'));
        }
        req.login(data, function(err) {
          req.session.save(function() {
            return done(null, docs[0]);
          });
        });
      } else {
        return done(null, false, req.flash('message', 'There is no such id.'));
      }
    });
  }
));


module.exports = app;
