// Load required packages
var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');

// Connect to Postgres
var client = new Client("postgres://dmac@localhost/ergo");

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