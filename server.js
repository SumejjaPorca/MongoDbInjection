// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var mongoose = require('mongoose');
var api = require('./config/api');
var db = require('./config/database');
var morgan = require('morgan');
var bodyParser = require('body-parser'); //check urlencoded injections with this parser


require('./models/compile')();

// Connect to database. If failed write message and exit with error status
mongoose.connect(db.database, function(err){
  if(err){
    console.error("Failed to connect to database.")
    console.error(err);
    process.exit(1);
  }
});


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// HTTP request logger - use it to log
app.use(morgan('dev'));

var port = process.env.PORT || api.port || 8080;        // set our port with --port arg, default: 8080

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Hooray! welcome to our api!' });
});



// Mount Main Controller on /api/ route
var MainCtrl = require('./controllers/main.controller');
router.use('/', MainCtrl);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);

console.log('Magic happens on port ' + port);
