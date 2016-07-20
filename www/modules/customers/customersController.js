app.controller('customersController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, $mdToast, dialog, $mdDialog) {
    //Variables & defaults
    $scope.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    $scope.filterInitial = "";



    $scope.tableHeaders = [{
        title:'COMPAÑÍA'
    },{
        title:'PAÍS'
    },{
        title:'CORREO ELECTRÓNICO'
    },{
        title:'TELÉFONO'
    },{
        title:'PLAZO CUMPLIDO'
    },{
        title:'FECHA DE PAGO'
    }];


    //Methods definition

    $scope.filterLetter = function(letter){
        if(letter == $scope.filterInitial){
            $scope.filterInitial = "";
        }else{
            $scope.filterInitial = letter;
        }
    };

    $scope.goCustomer = function(customer){
        $rootScope.inCustomer = customer;
        $state.go('main.customer', { id : ''+customer.id } );
        $timeout(function(){
            // window.location.reload();
        }, 2000)
    }

    // Fetch data

    api.customer.getFromPartner({
        id: $rootScope.user.id,
        success : function(data){
            $scope.customers = data;       
        },
        error : function(error){
            console.log(error);
        }
    })

    // Actions

    $scope.customer = {
        form : {
            fields : {
                name : '',
                email : '',
                address : '',
                phone : '',
                zip : '',
                country : '',
                city : '',
                language : '',
                profile : null,
                password : '',
                confirm : ''
            },
            create  : function(){
                api.profile.getAll({
                    params : 'entity=3&id&name',
                    success : function(data){
                        console.log(data);
                        $scope.profiles = data;
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
                dialog.create({
                  "title" : "Nuevo cliente",
                  "body": "<div layout='row' layout-wrap>"+
                    '<md-input-container flex="50">'+
                        '<label>Nombre</label>'+
                        '<input ng-model="customer.form.fields.name">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Email</label>'+
                        '<input ng-model="customer.form.fields.email">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Password</label>'+
                        '<input ng-model="customer.form.fields.password">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Confirmar password</label>'+
                        '<input ng-model="customer.form.fields.confirm">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<label>Dirección</label>'+
                        '<input ng-model="customer.form.fields.address">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Teléfono</label>'+
                        '<input ng-model="customer.form.fields.phone">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Código postal</label>'+
                        '<input ng-model="customer.form.fields.zip">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>País</label>'+
                        '<input ng-model="customer.form.fields.country">'+
                    '</md-input-container>'+
                    '<md-input-container flex="50">'+
                        '<label>Ciudad</label>'+
                        '<input ng-model="customer.form.fields.city">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<md-select ng-model="customer.form.fields.language" placeholder="Selecciona un idioma">'+
                            '<md-option value="es">Español</md-option>'+
                            '<md-option value="en">Inglés</md-option>'+
                        '</md-select>'+
                    '</md-input-container>'+
//                    '<md-input-container flex="50">'+
//                        '<md-select ng-model="customer.form.fields.profile" placeholder="Selecciona un perfil">'+
//                            '<md-option ng-value="{{profile.id}}" ng-repeat="profile in profiles">{{profile.name}}</md-option>'+
//                        '</md-select>'+
//                    '</md-input-container>'+
                  "</div>",
                  "data": "",
                  "buttons": [
                    {
                      "text": "Crear",
                      "action" : "customer.create"
                    },
                    {
                      "text": "Cancelar"
                    }
                  ]
                })
            },
            validate : function(callback){
                
                
                var error = {
                    count : 0,
                    message : "<p>Debe llenar los siguientes campos:</p><p>",
                    check : false
                }

                var form = $scope.customer.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if(form.name == ''){
                    error.count ++;
                    error.message = error.message + 'Nombre, ';
                }
                if(form.email == ''){
                    error.count ++;
                    error.message = error.message + 'Email, ';
                }
                if(form.password == ''){
                    error.count ++;
                    error.message = error.message + 'Password, ';
                }
                if(form.password == ''){
                    error.count ++;
                    error.message = error.message + 'Confirmar password, ';
                }
                if(form.password != form.confirm){
                    error.count ++;
                    error.message = error.message + 'Los passwords no concuerdan, ';
                }
                if(form.address == ''){
                    error.count ++;
                    error.message = error.message + 'Dirección, ';
                }
                if(form.phone == ''){
                    error.count ++;
                    error.message = error.message + 'Teléfono, ';
                }
                if(form.zip == ''){
                    error.count ++;
                    error.message = error.message + 'Código Postal, ';
                }
                if(form.country == ''){
                    error.count ++;
                    error.message = error.message + 'País, ';
                }
                if(form.city == ''){
                    error.count ++;
                    error.message = error.message + 'Ciudad, ';
                }
                if(form.language == ''){
                    error.message = error.message + 'Idioma, ';
                    error.count ++;
                }
                // Trim string
                error.message = error.message.substring(0, error.message.length-2) + '.</ p>'
                var testMail = re.test(form.email);
                if(!testMail){
                    error.count ++;
                    error.message = error.message + '<p>Ingresa un Email válido.</ p>';
                }

                if(form.password != form.confirm){
                    error.count ++;
                    error.message = error.message + '<p>Las contraseñas no coinciden.</p>';
                }

                $http.get('http://' + ip + port + '/product/1/user/'+ form.email).success(function(data){
                    if(data == 200){
                        error.count ++;
                        error.message = error.message + '<p>Este usuario ya existe en nuestra base de datos</p>';
                        if(error.count > 0){
                            error.check = false;
                        }else{
                            error.check = true;
                        }
                        callback(error);
                    }else{
                        $http.get('http://' + ip + port + '/product/2/user/' + form.email).success(function(data){
                            if(data == 200){
                                error.count ++;
                                error.message = error.message + '<p>Este usuario ya existe en nuestra base de datos</p>';
                                if(error.count > 0){
                                    error.check = false;
                                }else{
                                    error.check = true;
                                }
                                callback(error);
                            }else{
                                if(error.count > 0){
                                    error.check = false;
                                }else{
                                    error.check = true;
                                }
                                callback(error);
                            }
                        });
                    }


                })

            }
        },
        create : function(){
            // var error = $scope.customer.form.validate();
            $scope.customer.form.validate(function(error){
                if(error.check){
                    $rootScope.coreDialog = null;
                    api.customer.create({
                        customer : $scope.customer.form.fields,
                        success : function(data){
                            console.log(data);
                            // $scope.customers.push(data);
                            $scope.goCustomer(data);
                            $timeout(function(){
                                
                                $timeout(function(){
                                    $mdToast.showSimple('¡Cliente creado correctamente!');
                                }, 1000)
                            },1000)
                        },
                        error : function(error){
                            console.log(error);
                        }
                    })
                }else{
                    var confirm = $mdDialog.confirm()
                          .title('Formulario incompleto.')
                          .content(error.message)
                          .ok('Completar formulario')
                    $mdDialog.show(confirm).then(function(){});
                }
            });
        }
    }


    //check if access
    $timeout(function(){
        
        console.log('-------------------------')
        console.log($rootScope.profile)
        console.log('-------------------------')
        
        if(!$rootScope.profile.customers.module){
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

    }, 300);
});

