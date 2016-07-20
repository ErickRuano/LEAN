// server.js
  
	// set up ========================
	var express  = require('express');
	var app      = express(); 								// create our app w/ express
	var mongoose = require('mongoose'); 					// mongoose for mongodb
	//var autoIncrement = require('mongoose-auto-increment'); // mongoose auto-increment module
			// log requests to the console (express4)
	var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
	var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
	var mysql = require('mysql');



//********************************************************FTP
	var multipart = require('connect-multiparty');
	var multipartMiddleware = multipart();
	var flow = require('./flow-node.js')('tmp');

// Handle uploads through Flow.js
app.post('/upload', multipartMiddleware, function(req, res) {
    flow.post(req, function(status, filename, original_filename, identifier) {
        console.log('POST', status, original_filename, identifier);
        res.send(200, {
            // NOTE: Uncomment this funciton to enable cross-domain request.
            //'Access-Control-Allow-Origin': '*'
        });
    });
});

// Handle cross-domain requests
// NOTE: Uncomment this funciton to enable cross-domain request.
/*
  app.options('/upload', function(req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/

// Handle status checks on chunks through Flow.js
/*app.get('/upload', function(req, res) {
    flow.get(req, function(status, filename, original_filename, identifier) {

        console.log('GET', status);
        res.send(status == 'found' ? 200 : 404);
    });
});*/

app.get('/download/:identifier', function(req, res) {
	
	res.setHeader("Content-Type", 'image/png'); 
    flow.write(req.params.identifier, res);

});








	var  http = require('http').createServer(app),
	io = require('socket.io').listen(http);

//********************************TODO SOBRE SOCKET IO*********************////

io.sockets.on('connection', function(socket){

	 socket.on('registrame', function(data){// te registra en chat
	 	var destino= 'online'+data.madre;
	 	socket.username=data.username;
	 	socket.madre=destino;
	 	socket.join(destino);// SE UNEN A UN CHAT DE LA COMPANIA EN GENERAL...
		socket.join(data.username);// SE UNEN A SU PROPIO CHAT
	 	
	 	var clients = findClientsSocket(destino)
	 //	console.log('ESTTOOOOSS CLIENTES HAYY!!!! +++++++++++++++');
	 //	console.log(clients);

	 	socket.in(destino).emit('online', data.username);
	 	
	 });
	 socket.on('registramenetwork', function(data){// te registra globla en la red actual
	 	var s= data.idnetwork+''+data.name;
	 	s= s.replace(/\s+/g, '');
	 	socket.join(s);

	 	
	 });
	 socket.on('registramegroup', function(data){ // te regitra quiza exista chat grupal
	 	var s= data.idgroup+''+data.name;
	 	s= s.replace(/\s+/g, '');
	 	socket.join(s);

	 });


	 socket.on('sacamenetwork', function(data){ // te saca de la red
	 	var s= data.idnetwork+''+data.name;
	 	s= s.replace(/\s+/g, '');
	 	socket.leave(s); 
	 });
     socket.on('sacamegroup', function(data){  // te saca del grupo
	 	var s= data.idgroup+''+data.name;
	 	s= s.replace(/\s+/g, '');
	
     	socket.leave(s);
     });

	 socket.on('sacame', function(data){ // te saca de todo
	 	socket.leave(data.username);// se saca el mismo del chat

	 	console.log('SE DESCONECTO USUARIO++++++++++++'+data.username);
	 	var destino="online"+data.madre;
	    socket.in(destino).emit('offline', data.username); // emmite a toda la empresa q esta offline

	    socket.leave(destino); // se sale del chat general de toda la empresa

	 	
	 });

	 socket.on('disconnect', function() {
 
 	 var madre = socket.madre;
 	 var username= socket.username;
	 socket.in(madre).emit('offline',username);

	 socket.leave(username);
	 socket.leave(madre);


   	  });


    socket.on('send msg', function(data){ // envar mensajes personales
    	socket.in(data.to.username).emit('get msg', data);
    });

    socket.on('isonline?', function(data){ // eesta o no online

    	var clients = findClientsSocket(data.madre);

  
  for (var i=0; i<clients.length;i++){
  	cliente=clients[i];
  	if(cliente.username==data.usuario){
  		 socket.emit('online', data.usuario);

  	}

  }

    	
    });


    function findClientsSocket(roomId, namespace) {
		    var res = []
		    , ns = io.of(namespace ||"/");    // the default namespace is "/"

		    if (ns) {
		        for (var id in ns.connected) {
		            if(roomId) {
		                var index = ns.connected[id].rooms.indexOf(roomId) ;
		                if(index !== -1) {
		                    res.push(ns.connected[id]);
		                }
		            } else {
		                res.push(ns.connected[id]);
		            }
		        }
		    }
		    return res;
			}

    socket.on('send groupmsg', function(data){ // envar mensaje en el chat de grupos

    	var s= data.to.idgroup+''+data.to.name;
	 	s= s.replace(/\s+/g, '');
	 	console.log(s);
    	socket.in(s).emit('get groupmsg', data);
    });

    socket.on('send noti', function(data){ // enviar post
    	var destino='';
    	switch (data.location){
    		case 'group':
    			var s= data.to.idgroup+''+data.to.name;
			 	s= s.replace(/\s+/g, '');
    			destino =s;
    		break;
    		case 'network':
    			var s= data.to.idnetwork+''+data.to.name;
	 			s= s.replace(/\s+/g, '');
    			destino =s;
    		break;
    		case 'wall':
    			destino =data.to.username;
    		break;
    		case 'home.groups':
    			destino =data.to.username;
    		break;
    		case 'home.conversations':
    			destino =data.to.username;
    		break;


    	}

    	socket.in(destino).emit('get noti',data);
    });


});

	var connection = mongoose.connect('mongodb://54.243.132.87:3002/core');

	var connectionMySQL = mysql.createConnection({
		host: '54.243.132.87',
		user: 'root',
		password: 'pentcloud',
		database: 'core_produccion',
		port: 3306
	});

	
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://54.243.132.87');
  res.header('Access-Control-Allow-Origin', 'http://app.pentcloud.com');

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization, Content-Length, X-Requested-With");

  next();
 };


app.use(allowCrossDomain);


	app.use(express.static(__dirname + '/www')); 				// set the static files location /public/img will be /img for users
 										// log every request to the console
	app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
	app.use(bodyParser.json()); 									// parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());
	
	// listen (start app with node server.js) ======================================
	
	
	http.listen(3003);
	console.log("App listening on port 3003");

	require('./routes/api.js')(app, connectionMySQL);
