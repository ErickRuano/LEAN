app.factory('auth', function($window) {
  var  auth = {
    isLogged: false
  }
 
  return auth;
});

app.factory('userAuth', function($window, $location, $http, auth, localStorage) {
  return {
    login: function(username, password) {
      return $http.post('http://'+ip+port+'/login', {
        username: username,
        password: password
      });
    },
    logout: function() {
 
      if (auth.isLogged) {
 
        auth.isLogged = false;
        delete auth.user;
        delete auth.userRole;
 
        localStorage.delete('session');
 
        $location.path("/login");
      }
 
    }
  }
});

app.factory('tokenInterceptor', function($q, $window, localStorage, $timeout) {
  return {
    request: function(config) {
      console.log(config);
      if(config.url.indexOf('http://localhost:4000') != -1 ){
        config.headers = config.headers || {};
        if (localStorage.check('session')) {
          config.headers['Content-Type'] = "application/json";
        }
        return config || $q.when(config);        

      }else{

        config.headers = config.headers || {};
        if (localStorage.check('session')) {
          config.headers['X-Access-Token'] = localStorage.get('session').token;
          config.headers['X-Key'] = localStorage.get('session').user.username;
          config.headers['X-Client-Time'] = new Date().getTime() / 1000;
          config.headers['Content-Type'] = "application/json";
        }
        return config || $q.when(config);

      }
    },
 
    response: function(response) {
      if(response.status == 200 && response.data.message && response.data.status && response.data.status == 601){
        location.href = '/#/login';
        localStorage.delete('session');
      }
      if( ( response.status == 401 ) || ( response.data.message && response.data.status && response.data.status == 401) ){
        $timeout(function(){
          location.href = '/#/main/401';
        })
      }
      if( ( response.status == 404 ) || ( response.data.message && response.data.status && response.data.status == 404) ){
        $timeout(function(){
          location.href = '/#/main/404';
        })
      }
      return response || $q.when(response);
    }
  };
});

