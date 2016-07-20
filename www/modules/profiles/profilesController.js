app.controller('profilesController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, dialog, $mdToast, $mdDialog) {
	
    // Vars & Defaults
    $scope.tabSelected = 1;
    $scope.placeholder = false;
    $scope.profiles = [];

    $scope.templates = {
        partners : {
            products : {
                _1 : true,
                _3 : true,
                _4 : true,
                _8 : true,
                _9 : true,
                _2 : true
            },
            customers : {
                module : true,
                products : true,
                users : true,
                payments : true
            },
            partners : {
                module : true,
                payments : true
            },
            agents : {
                module : true
            },
            profiles : {
                module : true,
                partners : true,
                agents : true,
                customers : true
            }
        },
        agents : {
            products : {
                _1 : true,
                _3 : true,
                _4 : true,
                _8 : true,
                _9 : true,
                _2 : true
            },
            customers : {
                module : true,
                products : true,
                users : true,
                payments : true
            },
            partners : {
                module : true,
                payments : true
            },
            agents : {
                module : true
            },
            profiles : {
                module : true,
                partners : true,
                agents : true,
                cutomers : true
            }
        },
        customers : {

        }
    }
    $rootScope.profilesEntity = 1;
    //Methods
    $scope.changeTab = function(tab){
        if($scope.tabSelected != tab){
            $scope.tabSelected = tab;
            $rootScope.profilesEntity = tab;
            fetch(tab);
            delete $scope.profile;
        }
    }   

    // Fetch Data
    var fetch = function(entity){
        api.profile.getAll({
            params : 'entity='+entity,
            success : function(data){
                console.log(data);
                $scope.profiles = data;
                if($scope.profiles.length > 0){
                    $scope.profile = $scope.profiles[0];
                }
            },
            error : function(error){
                console.log(error);
            }
        })
    }
    fetch(1);



    // Core
    $scope.newProfile = {
        form : {
            fields : {
                name : '',
                model : {},
                entity : $scope.tabSelected
            },
            validate : function(){
                var error = {
                    count: 0,
                    message: '',
                    check: true
                }
                if($scope.newProfile.form.fields.name == ''){
                    error.count ++;
                    error.message = error.message + 'Debes llenar el campo Nombre'
                }
                if(error.count > 0){
                    error.check = false;
                }else{
                    error.check = true;
                }
                return error;      
            },
            create : function(entity){
                $scope.newProfile.form.fields= {
                    name : '',
                    model : cloneObj($scope.templates[entity]),
                    entity : $rootScope.profilesEntity
                }
                dialog.create({
                  "title" : "Nuevo perfil {{$root.profilesEntity}}",
                  "body": "<div layout='row' layout-wrap>"+
                    '<md-input-container flex="100">'+
                        '<label>Nombre</label>'+
                        '<input ng-model="newProfile.form.fields.name">'+
                    '</md-input-container>'+
                  "</div>",
                  "data": "",
                  "buttons": [
                    {
                      "text": "Crear",
                      "action" : "newProfile.create"
                    },
                    {
                      "text": "Cancelar"
                    }
                  ]
                })
            }
        },
        create : function(){
            var form = $scope.newProfile.form.validate();
            if (form.check) {
                api.profile.create({
                    profile : $scope.newProfile.form.fields,
                    success : function(data){
                        data.model = JSON.parse(data.model);
                        $scope.profile = $scope.profiles[$scope.profiles.push(data) -1];
                        dialog.destroy();
                        $mdToast.showSimple('Perfil creado correctamente.');
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
            } else {
                var confirm = $mdDialog.confirm()
                      .title('Formulario incompleto.')
                      .content(form.message)
                      .ok('Completar formulario')
                $mdDialog.show(confirm).then(function(){});
            }
        },
        update : function(){
            api.profile.update({
                id : $scope.profile.id,
                profile : $scope.profile,
                success : function(data){
                    $mdToast.showSimple('Perfil actualizado correctamente.');
                },
                error : function(data){
                    $mdToast.showSimple('Hubo un error en el proceso, intenta guardar nuevamente.');
                }
            })
        },
        delete : function(){

        }
    }

    //check if access
if(!$rootScope.profile.profiles.module){
    var none = true;
    if($rootScope.profile.customers.module){
        $state.go('main.customers');
        none = false;
    }
    if($rootScope.profile.partners.module){
        $state.go('main.partners');
        none = false;
    }
    if($rootScope.profile.agents.module){
        $state.go('main.agents');
        none = false;
    }
    if($rootScope.profile.profiles.module){
        $state.go('main.profiles');
        none = false;
    }
    if(none){
        location.href="http://www.pentcloud.com"
    }
}

});