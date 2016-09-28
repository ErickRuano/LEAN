module.exports = function(model){

  var template = {
   
   getOne: function(req, res) {


      var input = req.query;
      input.id = req.params.id;
      model.User.findById(input.id).then(function(data){
        res.send(data);
      });

    },
    create: function(req, res) {


      var input = req.query;
      
      model.User.create(input).then(function(data){
        res.send(data);
      });

    },
    update: function(req, res) {


      var input = req.query;
      input.id = req.params.id;

      model.User.update(input, { where: { id: input.id } }).then(function(data){
        res.send(data);
      });

    },
    delete: function(req, res) {


      var input = req.query;
      input.id = req.params.id;

      model.User.destroy({ where: { id: input.id } }).then(function(data){
        res.send("deleted");
      });

    },
}
   
    
  return template;

};