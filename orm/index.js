module.exports = function(Sequelize){
	$username = "erickruano";
	$password = "3r1ckRuano.";
	$db = "michaelrussdmd";
	// Connection to database
	var sequelize = new Sequelize('pentcloudsales', 'pentcloud', 'p3ntcl0ud@', {
	  host: '23.229.244.195',
	  dialect: 'mysql',
	  pool: {
	    max: 5,
	    min: 0,
	    idle: 10000
	  },
	});

	// Models definition
	var model = {};

	model.User = sequelize.define('user', {
	  username: Sequelize.STRING,
	  password: Sequelize.STRING
	});


	// Sync 
	sequelize
	  .sync({ force: true })
	  .then(function(err) {
	    console.log('It worked!');
	  }, function (err) { 
	    console.log('An error occurred while creating the table:', err);
	  });

	return model;

}