var express = require('express');
// Added in the Body Parser Middleware
var bodyParser = require('body-parser');
// Add in Express Validator
var expressValidator = require('express-validator');
// Add in the Multer middleware
var multer = require('multer');

var app = express();

// Adds functionality to parse json data
app.use(bodyParser.json({ type: 'application/json' }));
// We add the middleware after we load the body parser
app.use(expressValidator());

// Adds views
//app.set('views', './views');
//app.set('view engine', 'ejs');

// Add the postgres
var postgres = require('./js/postgres');

function lookupPhoto(req, res, next) {
	// Access the ID param on the request object
	var photoId = req.params.id;
	// Build an SQL query to select the resource object by ID
	var sql = 'SELECT * FROM photo WHERE id = $1';
	postgres.client.query(sql, [photoId], function(err, results){
		if (err) {
			console.error(err);
			res.statusCode = 500;
			return res.json({ errors: ['Could not retrieve photo']});
		}
	// No results returned mean the object is not found
	if (results.rows.length === 0) {
		// Set the HTTP status code on res object
		res.statusCode = 404;
		return res.json({ errors: ['Photo not found']});
	}
	// Attach the photo property to the request
	// The data is now available in the handler function
	req.photo = results.row[0];
	next();
	});
}

//Check the file size
function validatePhoto(req, res, next) {
  if (!req.files.photo) {
    res.statusCode = 400;
    return res.json({
      errors: ['File failed to upload']
    });
  }
  if (req.files.photo.truncated) {
    res.statusCode = 400;
    return res.json({
      errors: ['File too large']
    });
  }

  req.checkBody('description', 'Invalid description').notEmpty();
  req.checkBody('album_id', 'Invalid album_id').isNumeric();
  
  //Checking for validation errors
  var errors = req.validationErrors();
  if (errors) {
    var response = { errors: [] };
    errors.forEach(function(err) {
      response.errors.push(err.msg);
    });
    res.statusCode = 400;
    return res.json(response);
  }
  return next();
 }

// Create the router for Photos
var photoRouter = express.Router();

// Get request to root resource and add in Pagination
photoRouter.get('/', function(req, res) {
	var page = parseInt(req.query.page, 10);
		if (isNaN(page) || page < 1) {
		page = 1;
	}

	var limit = parseInt(req.query.limit, 10);
	if (isNaN(limit)) {
		limit = 10;
	} else if (limit > 50) {
		limit = 50;
	} else if (limit < 1) {
		limit = 1;
	}

  	var sql = 'SELECT count(1) FROM photo';
  	postgres.client.query(sql, function(err, result) {
    	if (err) {
	      console.error(err);
	      res.statusCode = 500;
	      return res.json({
	        errors: ['Could not retrieve photos']
      });
    }

    var count = parseInt(result.rows[0].count, 10);
    var offset = (page - 1) * limit;

    sql = 'SELECT * FROM photo OFFSET $1 LIMIT $2';
    postgres.client.query(sql, [offset, limit], function(err, result) {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        return res.json({
          errors: ['Could not retrieve photos']
        });
      }

      return res.json(result.rows);
    });
  });

});

// Post request to root
photoRouter.post('/', multer({
	dest: './uploads/',
	rename: function(field, filename) {
		filename = filename.replace(/\W+/g, '-').toLowerCase();
		return filename + '_' + Date.now();
	},
	limits: {
		files: 1,
		fileSize: 2 * 1024 * 1024 // 2mb, in bytes
	}
}), validatePhoto, function(req, res) {
	var sql = 'INSERT INTO photo (description, filepath, album_id) VALUES ($1,$2,$3) RETURNING id';
  	var data = [
    req.body.description,
    req.body.photo.path,
    req.body.album_id
  ];
  postgres.client.query(sql, data, function(err, result) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({
        errors: ['Could not create photo']
      });
    }

    var photoId = result.rows[0].id;
    var sql = 'SELECT * FROM photo WHERE id = $1';
    postgres.client.query(sql, [ photoId ], function(err, result) {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        return res.json({ errors: ['Could not retrieve photo after create'] });
      }

      res.statusCode = 201;
      res.json(result.rows[0]);
    });
  });
});

// Request to get a specific object and added RegEx
photoRouter.get('/:id([0-9]+)', lookupPhoto, function(req, res) {
	res.json(req.photo);
});

// Adding a PATCH request to specific object
photoRouter.patch('/:id([0-9]+)', function(req, res) {});

// Deletion of a specific object
photoRouter.delete('/:id', function(req, res) {});

// This attaches the router to a path
app.use('/photo', photoRouter);

// Add photo uploader
var uploadRouter = express.Router();
uploadRouter.get('/', function(req, res) {
  res.render('form');
});
app.use('/upload', uploadRouter);

/*
//See comments above for the logic
var albumRouter = express.Router();
albumRouter.get('/', function(req, res) {});
albumRouter.post('/', function(req, res) {});
albumRouter.get('/:id', function(req, res) {});
albumRouter.patch('/:id', function(req, res) {});
albumRouter.delete('/:id', function(req, res) {});
app.use('/album, albumRouter');
*/

// Attached to Node Modules
module.exports = app; 