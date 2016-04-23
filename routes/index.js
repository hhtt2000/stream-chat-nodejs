var express = require('express');
var router = express.Router();
var Datastore = require('nedb');
var db = new Datastore();

/* GET home page. */
router.get('/', function(req, res, next) {
  var displayName = req.session.displayName;
  res.render('index', { title: 'Video Streaming Chat', id: displayName });
});

router.get('/signup', function(req, res, next) {
	if(req.session.displayName) {
		res.redirect('/');
	}
	res.render('signup');
});

router.post('/signup', function(req, res, next) {
	var data = {
		id: req.body.id,
		password: req.body.password
	};
	db.insert(data, function(err, newDoc) {
		if(err) {
			res.redirect('back');
		}
		req.session.displayName = newDoc.id;
		req.session.save(function() {
			res.redirect('/');
		});
	});
});

router.get('/login', function(req, res, next) {
	res.render('login');
});

router.post('/login', function(req, res) {
	var data = {
		id: req.body.id,
		password: req.body.password
	};
	db.find(data, function(err, docs) {
		if(err) {
			res.redirect('back');
		}
		if(docs[0]) {
			req.session.displayName = docs[0].id;
			req.session.save(function() {
				res.redirect('/');
			});	
		} else {
			console.log('no info for given id.');
			res.redirect('back');
		}
	});
});

router.get('/logout', function(req, res) {
	delete req.session.displayName;
	req.session.save(function() {
		res.redirect('/');
	});
});

router.get('/channel', function(req, res) {
	res.render('channel');
});

router.get('/channel/:user', function(req, res, next) {
  var loginUser = req.session.displayName;
  var streamUser = req.params.user;
  var isStreamer = (loginUser === streamUser) ? true : false;
  res.render('room', {user: loginUser, isStreamer: isStreamer});
});

module.exports = router;
