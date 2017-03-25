// user model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type:String,
    required:true,
    minlength:6,
    lowercase: true
  },
  email:{
    type:String,
    required:true,
    lowercase: true
  },
  firstName:{
    type:String
  },
  lastName:{
    type:String
  },
  password:{
    type:String,
    required:true
  },
  role:{
    type: String,
    enum : ['regular', 'admin'],
    default : 'regular'
  }
});

module.exports = mongoose.model('user', UserSchema);
