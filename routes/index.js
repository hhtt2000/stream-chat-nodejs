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
	db.find({id: {$exists: true}}, function(err, docs) {
		if(err) {
			res.redirect('/');
		}
		//TODO 각 스트리머의 방에서 비디오 태그를 받아옴
		res.render('channel', {rooms: docs});
	});
});

router.get('/channel/:user', function(req, res, next) {
  var user = req.params.user;
  var isStreamer = (req.session.displayName === user) ? true : false;
  console.log('isStreamer in router : ', isStreamer);
  res.render('room', {user: user, isStreamer: isStreamer});
});

module.exports = router;
