var db = require('../../config/mysql.js')();
var httpStatus = require('../../config/httpStatusCodes')();

var template = {
 
  getAll: function(req, res) {

    // input
    var input = req.query;
    
    // defaults
    var session = req.session;
    var timeStamp = req.clientTime;

    var select = db.select(input);

    // dynamic fields query
    var query  = "SELECT "+select+" FROM template;";
    var params = [];
    
    db.execute(query, params, function(data){
      console.log(data);
      if(data.length > 0){
        res.send(data);
      }else{
        res.send(httpStatus._404);
      }
    });  

  },
  getOne: function(req, res) {

    // input
    var input = req.query;
    var id = req.params.id;
    
    // defaults
    var session = req.session;
    var timeStamp = req.clientTime;

    
    var select = db.select(input);
    

    var query  = "SELECT "+select+" FROM template WHERE id = ?;";
    var params = [id];
    
    db.execute(query, params, function(data){
      console.log(data)
      if(data[0]){
        var element = data[0];
        res.send(element);
      }else{
        res.send(httpStatus._400);
      }

    });  

  },
 
  create: function(req, res) {
    // input
    var input = req.body;
    console.log('input')
    console.log(input)
    
    // defaults
    var session = req.session;
    var timeStamp = req.clientTime;

    // INSERT INTO stmt for query
    var values = db.insert(input);
    
    var query  = "INSERT INTO template ("+values.insert+") VALUES ("+values.query+");";
    console.log('query');
    console.log(query);
    var params = values.params;
    console.log(params);

    db.execute(query, params, function(data){
      if(data.errno){
        // On any error
        if(data.errno == 1062){
          // If error is duplicate entry
          res.send(httpStatus._600)
        }else{
          // On any other error
          res.send(httpStatus._400)
        }
      }else{
        // On successful insert
        input.id = data.insertId;
        res.send(input);
      }
    });  

  },
 
  update: function(req, res) {
    
    // input
    var input = req.body;
    var id = req.params.id;
    
    // defaults
    var session = req.session;
    var timeStamp = req.clientTime;

    var set = db.set(input);

    // dynamic fields query
    console.log(set)
    var query  = "UPDATE template SET "+set+" WHERE id = ?;";
    var params = [id];

    db.execute(query, params, function(data){
      console.log(data)
      if(data.errno){
        // On any error
        if(data.errno == 1062){
          // If error is duplicate entry
          res.send(httpStatus._600)
        }else{
          // On any other error
          res.send(httpStatus._400)
        }
      }else{
        // On successful update
        res.send(httpStatus._200);
      }
    });  
  },
 
  delete: function(req, res) {

    // input
    var input = req.body;
    var id = req.params.id;
    
    // defaults
    var session = req.session;
    var timeStamp = req.clientTime;

    var query  = "DELETE FROM template WHERE id = ?";
    var params = [id];
    
    db.execute(query, params, function(data){
      res.send(data);
    });  

  }
};
 
module.exports = template;