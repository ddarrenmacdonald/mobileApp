// Load required packages
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');

// Connect to Postgres
var conString = "postgres://dmac@localhost/ergo";

var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
    client.end();
  });
}); 

// Create the Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// Establish port for use
var port = process.env.PORT || 3000;

// Create the Express router
var router = express.Router();

// Testing route 
router.get('/', function(req, res) {
	res.json({message: 'You really need an ergo assessment'});
});

// Register routes with path /api 
app.use('/api', router);

// Start server
app.listen(port);
console.log('Adjusting on port' + port);