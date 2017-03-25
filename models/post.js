// post model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  user_id:{
    type: String,
    required: true
  },
  content:{
    type: String,
    required: true
  },
  created:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('post', PostSchema);
