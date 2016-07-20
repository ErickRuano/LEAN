var express = require('express');
var router = express.Router();

var db = require('../config/mysql.js')();
 
var auth = require('./auth.js');

// <@@@CatalogueLoader>
var template = require('./v1/template');
// </@@@CatalogueLoader>

/*
 * Routes that can be accessed by anyone
 */
 
	router.post('/login', auth.login);


/*
 * Routes that can be accessed only by authenticated users
 */

 // <@@@CatalogueLoader>

	/*
	 * Template API
	 */

	 router.get('/api/v1/template', template.getAll);
	 router.get('/template', template.getAll);

	 router.get('/api/v1/template/:id', template.getOne);
	 router.get('/template/:id', template.getOne);

	 router.post('/api/v1/template/', template.create);
	 router.post('/template', template.create);

	 router.put('/api/v1/template/:id', template.update);
	 router.put('/template/:id', template.update);

	 router.delete('/api/v1/template/:id', template.delete);
	 router.delete('/template/:id', template.delete);

// </@@@CatalogueRouter>

		
module.exports = router;