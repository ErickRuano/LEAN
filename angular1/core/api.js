var v = "1";

app.factory('api', ['$http', '$rootScope', '$interval', 'login',
    function($http, $rootScope, $interval, login) {
        var api = {
            template: {
                getAll: function(options) {
                    if (!options.params) {
                        options.params = '';
                    }
                    var url = 'http://' + ip + port + '/api/v' + v + '/template?' + options.params;

                    $http.get(url).success(function(data) {
                        options.success(data);
                    }).error(function(error) {
                        options.error(error);
                    });

                },
                getOne: function(options) {

                    if (!options.params) {
                        options.params = '';
                    }

                    var url = 'http://' + ip + port + '/api/v' + v + '/template/' + options.id + '?' + options.params;

                    $http.get(url).success(function(data) {
                        options.success(data);
                    }).error(function(error) {
                        options.error(error);
                    });

                },
                create: function(options) {

                    var url = 'http://' + ip + port + '/api/v' + v + '/template/';

                    $http.post(url, options.template).success(function(data) {
                        options.success(data);
                    }).error(function(error) {
                        options.error(error);
                    });

                },
                update: function(options) {
                    var url = 'http://' + ip + port + '/api/v' + v + '/template/' + options.id;

                    $http.put(url, options.template).success(function(data) {
                        options.success(data);
                    }).error(function(error) {
                        options.error(error);
                    });
                },
                delete: function(options) {
                    var url = 'http://' + ip + port + '/api/v' + v + '/template/' + options.id;

                    $http.delete(url, {}).success(function(data) {
                        options.success(data);
                    }).error(function(error) {
                        options.error(error);
                    });
                }
            }
        }
        return api;
    }
])