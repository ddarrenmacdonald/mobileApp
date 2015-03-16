var express = require('express');
// Added in the Body Parser Middleware
var bodyParser = require('body-parser');
// Add in Express Validator
//var expressValidator = require('express-validator');
// Add in the Multer middleware
//var multer = require('multer');

var app = express();

// Adds functionality to parse json data
app.use(bodyParser.json({ type: 'application/json' }));
/*
// We add the middleware after we load the body parser
app.use(expressValidator());
// Add the postgres
var postgres = require('./js/postgres');
*/

function lookupAssessment(req, res, next) {
	var assessmentId = req.params.id;
	var sql = 'SELECT * FROM asseessment WHERE id = $1';
	postgres.client.query(sql, [assessmentId], function(err, results){
		if (err) {
			console.error(err);
			res.statusCode = 500;
			return res.json({errors: ['Could not retrieve assessment']});
		}
	})
}

// Add it Assessment Data
var assessmentRouter = express.Router();
assessmentRouter.get('/', function(req, res) { });
assessmentRouter.post('/', function(req, res) { });
assessmentRouter.get('/:id', lookupAssessment, function(req, res) { });
assessmentRouter.patch('/:id', lookupAssessment, function(req, res) { });
assessmentRouter.delete('/:id', lookupAssessment, function(req, res) { });
app.use('/assessment', assessmentRouter);



// Attached to Node Modules
module.exports = app;