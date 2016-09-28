var express = require('express');
var lusca = require('lusca');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
 
var app = express();

app.use(express.static(__dirname + '/angular1'));        // set the static files location /public/img will be /img for users
app.use(bodyParser.urlencoded({'extended':'true'}));      // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                   // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.disable('etag');

app.use(bodyParser.json());
 
app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,X-Client-Time');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});
 
// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed
app.all('/api/v1/*', [require('./middlewares/validateRequest')]);

var model = require('./orm')(Sequelize);
 
app.use('/', require('./routes')(model));
 
// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
});

// Lusca config
app.use(lusca({
    csrf: true,
    // csp: { /* ... */},
    xframe: 'SAMEORIGIN',
    // p3p: 'ABCDEF',
    // hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
    xssProtection: true,
    nosniff: true
}));
 
// Start the server
app.set('port', process.env.PORT || 4000);

 
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
  console.log(__dirname);
});