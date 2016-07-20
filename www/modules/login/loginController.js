app.controller('loginController',function ($scope,$state,$rootScope,md5,login,localStorage){
	if(localStorage.check('session')){
    	$state.go('main.customers');
    }else{
		$scope.login = {
			go : function(){
				login.regular($scope.login.username, $scope.login.password, function(data){
					$state.go('main.customers');
				})
			},
			username : "",
			password: ""
		}
    }
    $scope.cleanWarning = function(){
        $rootScope.loginError = false;
        $rootScope.blocked = false;
    }
});