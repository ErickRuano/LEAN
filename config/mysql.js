module.exports = function() {
	var mysql      = require('mysql');
	var pool  = mysql.createPool({
	  	connectionLimit : 10000,
		waitForConnections:true,
		multipleStatements:true,
	  	host: 'localhost',
		user: 'root',
		password: 'pentcloud',
		database: 'template',
		port: 3306
	});


	var execute = function (query, values, callback, data){
		pool.getConnection(function(err, connection) {
			connection.query(query, values, function(error, result){
				if(error){
					connection.release();
					callback(error);
				}else{
					connection.release();
					if(data == undefined){
						callback(result);
					}else{
						callback(result, data);
					}
				}
			});

		});

	};

	var selectConstructor = function(input){
		// SELECT satement for query
	    var select = '';
	    for(key in input){
	        select = select + key + ', ';
	    }
	    if(select == ''){
	      // If no parameters
	      select = '*';
	    }else{
	      // Clean last comma
	      select = select.substring(0, select.length - 2);
	    }
	    return select;
	}

	var insertConstructor = function(input){
		var values = {
	      insert : '',
	      query : '',
	      params : []
	    };
	    for(key in input){
	      values.insert = values.insert + key + ', ';
	      values.query = values.query + '?, ';
	      values.params.push(input[key]);
	    }
	    // Clean last comma
	    if(values.insert != ''){
	      values.insert = values.insert.substring(0, values.insert.length - 2);
	      values.query = values.query.substring(0, values.query.length - 2);
	    }
	    console.log('-------------------values');
	    console.log(values);
	    return values;
	}

	var setConstructor = function (input) {
		// SET stmt for query
	    var set = '';
	    for(key in input){
	      if(key != 'confirm'){ // prevent query fail
	        set = set + key + ' = "' + input[key] + '", ';
	      }
	    }
	    if(set != ''){
	      // Clean last comma
	      set = set.substring(0, set.length - 2);
	    }
	    return set;
	}

	return {
		execute : execute,
		select : selectConstructor,
		insert : insertConstructor,
		set : setConstructor,
	};
}