// claim model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClaimSchema = new Schema({
  token:{
    type: String,
    required: true
  },
  user_id:{
    type: String,
    required: true
  },
  valid:{
    type: Boolean,
    required: true
  },
  created:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('claim', ClaimSchema);
