module.exports = function() {
  return {
  	_200 : {
  		"status": 200,
		"message": "OK"
  	},
  	_201: {
  		"status": 201,
		"message": "Created"
  	},
  	_204: {
  		"status": 204,
		"message": "No Content"
  	},
  	_304: {
  		"status": 304,
		"message": "Not Modified"
  	},
  	_400: {
  		"status": 400,
		"message": "Bad Request"
  	},
  	_401: {
  		"status": 401,
		"message": "Unauthorized"
  	},
  	_403: {
  		"status": 403,
		"message": "Forbidden"
  	},
  	_404: {
  		"status": 404,
		"message": "Not Found"
  	},
  	_500: {
  		"status": 500,
		"message": "Internal Server Error"
  	},
    _600: {
      "status": 600,
    "message": "Duplicate Entry"
    },
    _601: {
      "status": 601,
    "message": "Token expired"
    },
    _602: {
      "status": 602,
    "message": "Blocked by administrator"
    },
    _603: {
      "status": 603,
    "message": "Unkown password"
    }
  }
}