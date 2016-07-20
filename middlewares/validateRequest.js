var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;
var httpStatus = require('../config/httpStatusCodes')();
 
module.exports = function(req, res, next) {

  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 
 
  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  // var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

  if (token) {
    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());
 
      if (decoded.exp <= Date.now()) {
        res.status(200);
        res.json(httpStatus._601);
        return;
      }
      
      req.clientTime = req.headers['x-client-time'];
      req.session = decoded;

      // Authorize the user to see if s/he can access our resources
      validateUser(decoded.username, function(dbUser){ // The key would be the logged in user's username

          if (dbUser) {
     
     
            if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
                next() // To move to next middleware
            } else {
              res.status(403);
              res.json({
                "status": 403,
                "message": "Not Authorized"
              });
              return;
            }
          } else {
            // No user with this name exists, respond back with a 401
            res.status(401);
            res.json({
              "status": 401,
              "message": "Invalid User//"
            });
            return;
          }
      }); 
 
    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(200);
    res.json(httpStatus._601);
    return;
  }
};