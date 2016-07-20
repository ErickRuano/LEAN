app.factory('localStorage', function($cookieStore, $rootScope) {


    return {

        save: function(llave, valor) {

            if (typeof(Storage) != "undefined") {
                // Store

                localStorage.setItem(llave, JSON.stringify(valor));
                // Retrieve
            } else {
                alert('NO HAY SOPORTE DE DB');
            }



        },
        check: function(llave) {
            if (typeof(Storage) != "undefined") {
                if (localStorage.getItem(llave) != null) {

                    return true;
                } else {

                    return false;
                };
            } else {
                alert('NO HAY SOPORTE DE DB');
            }

        },
        get: function(llave) {


            if (typeof(Storage) != "undefined") {
                if (localStorage.getItem(llave) != null) {

                    var retrievedObject = localStorage.getItem(llave);

                    return JSON.parse(retrievedObject);
                } else {

                    return {};
                };
            } else {
                alert('NO HAY SOPORTE DE DB');
            }


        },
        delete: function(llave) {

            localStorage.removeItem(llave);
        }

    }

});

app.factory('login', function($rootScope, auth, userAuth, $window, $state, localStorage) {
    return {
        regular: function(username, password, callback) {

            if (username !== undefined && password !== undefined) {
                userAuth.login(username, password).success(function(data) {
                    if (data.status && data.status == 602) {
                        $rootScope.blocked = true;
                        $rootScope.loginError = false;
                    } else {
                        $rootScope.blocked = false;

                        auth.isLogged = true;
                        auth.user = data.user.username;
                        auth.userRole = data.user.role;

                        //* token interceptor auth *//
                        var session = {
                            user: data.user,
                            token: data.token
                        }

                        localStorage.save('session', session);

                        callback(data);

                    }
                }).error(function(status) {
                    $rootScope.loginError = true;
                    $rootScope.blocked = false;
                });
            } else {
                $rootScope.loginError = true;
                $rootScope.blocked = false;
            }
        },
        logout: function() {
            localStorage.delete('session');
            $state.go('login');
        }
    }

})