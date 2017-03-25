var mongoose = require('mongoose');
var User = mongoose.model('user');
var Claim = mongoose.model('claim');
var config = require('../config/auth');
var moment = require('moment');

module.exports = authMiddleware;

function authMiddleware(req,res,next){
  var tok = req.body.token || req.query.token || req.headers['x-access-token'];

  if(!tok){
    // there is no token
    res.status(401).json({
      success:false,
      message:"No token provided."
    });

  } else {
    // check token
    Claim.findOne({token: tok}, function(err, claim){
      if(err){
        return res.status(401).json({
          success:false,
          message: "Token is not valid."
        });
      }
      if(!claim){
        return res.status(401).json({
          success:false,
          message: "Token does not exist."
        });
      }
      if(!claim.valid){
        return res.status(401).json({
          success:false,
          message: "Token is not valid."
        });
      }
      var now = new Date();
      var expiration = new Date(moment(claim.created).add(config.tokenExpiration, 's'));
      if(expiration.getTime() < now.getTime()){
        return res.status(401).json({
          success:false,
          message: "Token has expired."
        });
      }
      // There is no errors
      // If token is valid and succesfully decoded, find user and save it for use in other routes
      User.findOne({_id:claim.user_id}).then(function(user){
        if (!user){
          return res.status(401).json({
            success:false,
            message:"No user."
          });
        } else {
          // User found - save it for later use
          delete user.password;
          req.user = user;
          next();
        }

      }, function(err){ // Database error
        return res.status(505).json({
          success:false,
          message:"Internal error."
        });
      });
    });
  }
};
