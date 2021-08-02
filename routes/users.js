var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var Post = require('../models/Post')

router.get('/new', function(req, res) {
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user: user, errors: errors });
});

router.post('/', function(req, res) {
  User.create(req.body, function(err, user) {
    if (err) {
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/login');
  });
});

router.get('/:username', function(req, res) {
  Promise.all([
    User.findOne({ username: req.params.username }),
  ])
  .then((user) => {
    Post.find({ author : user[0]._id }).populate('author').exec()
    .then((review) => {
      console.log(user);
      res.render('users/show', {
        user: user[0],
        posts: review
      });
    });
  })
  .catch((err) => {
    console.log('err: ', err);
    return res.json(err);
  });
});

router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res) {
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if (!user) {
    User.findOne({ username: req.params.username }, function(err, user) {
      if (err) return res.json(err);
      res.render('users/edit', { username: req.params.username, user: user, errors: errors });
    });
  } else {
    res.render('users/edit', { username: req.params.username, user: user, errors: errors });
  }
});

router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next) {
  User.findOne({ username: req.params.username })
    .select('password')
    .exec(function(err, user) {
      if (err) return res.json(err);

      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (var p in req.body) {
        user[p] = req.body[p];
      }

      user.save(function(err, user) {
        if (err) {
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/' + req.params.username + '/edit');
        }
        res.redirect('/users/' + user.username);
      });
    });
});

module.exports = router;

function checkPermission(req, res, next){
 User.findOne({username:req.params.username}, function(err, user){
  if(err) return res.json(err);
  if(user.id != req.user.id) return util.noPermission(req, res);

  next();
 });
}