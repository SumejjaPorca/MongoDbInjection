var express    = require('express');
var mongoose = require('mongoose');
var User = mongoose.model('user');
var Claim = mongoose.model('claim');
var Post = mongoose.model('post');
var passHash = require('password-hash');
var randtoken = require('rand-token');
var config = require('../config/auth');
var authorize = require('../middlewares/authMiddleware');

var ctrl = express.Router();

//Schema injection
//register
ctrl.post('/register', function(req,res){
  req.body.password = passHash.generate(req.body.password);
  var newUser = new User(req.body);
  newUser.save()
          .then(function(user){
            res.status(201).send();
          })
          .catch(function(err){
            res.status(400).json(err);
          });
  });

//query injection - try to find all users with specified password
//login
ctrl.post('/login', function(req,res){
  User.findOne({username:req.body.username}).then(function(user){
    // check does user exist
    if (!user){
      res.status(400).json({
        success:false,
        message:"Wrong username or password."});
    }
    else {
    // check does password match
      if(!passHash.verify(req.body.password, user.password)){
        // password doesn't match
        res.status(400).json({
          success:false,
          message:"Wrong password."});
      } else {
        // password match
        // get token
        var token = randtoken.generate(16);
        var claim = new Claim();
        claim.token = token;
        claim.user_id = user._id;
        claim.valid = true;
        claim.save().then(function(claim){
          // return token
          res.status(200).json({
            success: true,
            message: "Login successful.",
            token: claim.token,
            role: user.role,
            username: user.username
          });})
          .catch(function(err){
            return res.status(505).json({
                success:false,
                message:"Internal error."
              });});

      }
    }

  }, function(err){
    return res.status(505).json({
      success:false,
      message:"Internal error."
    });
  });
});

//DO something very risky
//query injection when authorizing - when only one req is possible - data update
//authorized
ctrl.put('/naughty', authorize, function(req,res){
  return res.status(202).json({
    success:true,
    message:"You have done the naughty thing."
  });
});

//vulnerable
function filterPosts(input_date, input_id){
  return "var d = new Date(obj.created); return d.getTime() < " + input_date.toString() + " && obj.user_id == '" + input_id + "'";
}

//js function injection - ddos or data loss
//delete all posts older from spec. date
//authorized
ctrl.delete('/posts', authorize, function(req,res){
  var input_date = req.body.date;
  var input_id = req.user._id;
  var fun = filterPosts(input_date, input_id);
  console.log(fun);
  Post.remove({$where: fun},
  function(err){
    if(err)
      return res.status(500).json(err);
      return res.status(204).json("Posts deleted.");
    });
  });

//query injection when authorizing - to get user id and abuse it
//get all user info
//authorized
ctrl.get('/info', authorize, function(req,res){
  var now = new Date();
  console.log(now.getTime());
  User.findOne({_id: req.user._id}, function(err, u){
    if(err)
    return res.status(501).json({
      success:false,
      message:"Internal error."
    });
    if(!u)
    return res.status(501).json({
      success:false,
      message:"Internal error."
    });
    return res.status(200).json({username: u.username, id:u._id, firstname: u.firstName});
  });
});

//simple query injection
//get public info about user with spec. username
//username param in request
ctrl.get('/users', function(req, res){
  //TO DO
  return res.status(501).json({
    success:false,
    message:"Internal error."
  });
});


ctrl.get('/posts', function(req, res){
  Post.find({}, function(err, posts){
    if(err)
    return res.status(501).json({
      success:false,
      message:"Internal error."
    });
    return res.status(200).json(posts);
  })

});

//write new post
//authorized
ctrl.post('/posts', authorize, function(req,res){
  var newPost = new Post();
  newPost.content = req.body.content;
  newPost.user_id = req.user._id;
  newPost.save().then(function(p){
    return res.status(201).json({
      success:true,
      message:"You have created new post."
    });
  })
  .catch(function(err){return res.status(501).json({
    success:false,
    message:"Internal error."
  });});
});



module.exports = ctrl;
