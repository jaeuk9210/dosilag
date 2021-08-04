var express = require('express');
var router = express.Router();
var Book = require('../models/Book');
var Post = require('../models/Post');
var passport = require('../config/passport');
var util = require('../util');
const Mongoose  = require('mongoose');
const ObjectID = Mongoose.Types.ObjectId;

router.get('/', async function(req, res) {
  //진중문고 5개 랜덤 추출
  var seoul = await divisionBook('인기 대출 도서');
  //국방전자도서관 5개 랜덤 추출
  var gimcheon = await divisionBook('베스트 셀러');
  
  var rank = await Post.aggregate([
    {
      $group : {
        _id: "$author",
        num_like : {$sum:{ $size: "$likes" }},
        reviews_title : {$push : "$title"},
        reviews_id : {$push : "$_id"}
      }
    },
    {
      $sort : {num_like :-1}
    },
    { $limit: 3 },
    {
      $lookup : {
        "from": "users",
        "localField": "_id",
        "foreignField": "_id",
        "as": "users"
      }
    }
  ]);

	var review = [];
  var myChoice = [];
  var likeReview = [];
	if (req.isAuthenticated()) {
    Promise.all([
      Post.find({ author: req.user.id }).populate('book'),
      Post.find({ likes: req.user.id }).populate('author'),
      Post.aggregate([
        { $unwind : { path: "$likes", preserveNullAndEmptyArrays: true } },
        { $match : { likes: new ObjectID(req.user.id) } },
        { $group : {_id: "$author"} },
        { $lookup : {
          "from": "users",
          "localField": "_id",
          "foreignField": "_id",
          "as": "users"
        } }
      ])
    ])
    .then(([review, likeReview, myChoice]) => {
      res.render('home/index', {
        seoul: seoul,
        gimcheon: gimcheon,
        rank: rank,
        post: review,
        myChoice: myChoice,
        likeReview: likeReview
      });
    })
    .catch((err) => {
      console.log('err: ', err);
      return res.json(err);
    });
	} else {
    res.render('home/index', {
      seoul: seoul,
      gimcheon: gimcheon,
      rank: rank,
      post: review,
      myChoice: myChoice,
      likeReview: likeReview
    });
  }
});

router.get('/login', function(req, res) {
	var username = req.flash('username')[0];
	var errors = req.flash('errors')[0] || {};
	res.render('home/login', {
		username: username,
		errors: errors
	});
});

router.post(
	'/login',
	function(req, res, next) {
		var errors = {};
		var isValid = true;

		if (!req.body.username) {
			isValid = false;
			error.username = 'Username is required!';
		}
		if (!req.body.password) {
			isValid = false;
			errors.password = 'Password is required!';
		}

		if (isValid) {
			next();
		} else {
			req.flash('errors', errors);
			res.redirect('/login');
		}
	},
	passport.authenticate('local-login', {
		successRedirect: '/books',
		failureRedirect: '/login'
	})
);

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;

async function divisionBook(type) {
	var book = await Book.aggregate(
		[{ $match: { type: RegExp('(' + type + ')$') } }, { $sample: { size: 5 } }],
		function(err, result) {
			if (err) {
				req.flash('Error', { _id: null, errors: util.parseError(err) });
			} else {
        console.log(result);
				book = result;
			}
		}
	);
  console.log(book);
	return book;
}
