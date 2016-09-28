app.controller('mainController', function($scope, $rootScope, $state, $interval, $timeout, api, localStorage, login) {

    if (localStorage.check('session')) {
        $rootScope.user = localStorage.get('session').user;
    } else {
        $timeout(function() {
            // $state.go('login');
        });
    };

    $rootScope.JSON = JSON;

    
    $scope.logout = login.logout;

    
    api.template.getAll({
        params: 'name&dpi',
        success: function(data) {
            console.log('data')
            console.log(data)
        }
    })
    
});