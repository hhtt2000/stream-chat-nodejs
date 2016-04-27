var express = require('express');
var router = express.Router();
var Datastore = require('nedb');
var db = new Datastore();
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('index session value: ', req.user);
  if(req.user) {
  	var displayName = req.user.displayName;	
  }
  res.render('index', { title: 'Video Streaming Chat', displayName: displayName });
});

router.get('/signup', function(req, res, next) {
	if(req.user) {
		res.redirect('/');
	}
	res.render('signup');
});

router.post('/signup', function(req, res, next) {
	var hash = bcrypt.hashSync(req.body.password);
	var data = {
		id: req.body.id,
		password: hash,
		displayName: req.body.displayName
	};
	db.insert(data, function(err, newDoc) {
		if(err) {
			res.redirect('back');
		}
		req.login(data, function(err) {
			req.session.save(function() {
				res.redirect('/');
			});
		});
	});
});

router.get('/login', function(req, res, next) {
	var message = req.flash('message')[0];
	res.render('login', {message: message});
});

router.post('/login',
	passport.authenticate('local', {failureRedirect: '/login',
									failureFlash: true})
								, function(req, res, next) {
	req.session.save(function(err) {
		if(err) {
			return next(err);
		}
		res.redirect('/');
	});								
});

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
	passport.authenticate('facebook', {failureRedirect: '/login'}),
	function(req, res, next) {
		req.session.save(function(err) {
			if(err) {
				next(err);
			}
			res.redirect('/');
		});
	}
);

router.get('/logout', function(req, res) {
	req.logout();
	req.session.save(function() {
		res.redirect('/');
	});
});

router.get('/channel', function(req, res) {
	res.render('channel');
});

router.get('/channel/:user', function(req, res, next) {
  var loginUser;
  if(req.user) {
  	loginUser = req.user.displayName;
  }
  var streamUser = req.params.user;
  var isStreamer = (loginUser === streamUser) ? true : false;
  res.render('room', {user: loginUser, streamUser: streamUser, isStreamer: isStreamer});
});

// module.exports = router;
exports.routes = router;
exports.db = db;
