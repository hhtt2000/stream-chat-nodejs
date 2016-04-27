var express = require('express');
var router = express.Router();
var Datastore = require('nedb');
var db = new Datastore();
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  var displayName = req.user;
  res.render('index', { title: 'Video Streaming Chat', id: displayName });
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
		password: hash
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
	passport.authenticate('local', {successRedirect: '/',
									failureRedirect: '/login',
									failureFlash: true}
						)
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
  var loginUser = req.user;
  var streamUser = req.params.user;
  var isStreamer = (loginUser === streamUser) ? true : false;
  res.render('room', {user: loginUser, isStreamer: isStreamer});
});

// module.exports = router;
exports.routes = router;
exports.db = db;
