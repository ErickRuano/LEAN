app.controller('partnerController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, dialog, $mdDialog, $mdToast, $interval) {

    //Variables & defaults
    $scope.tabSelected = 1;
    $scope.total = 1000;

    var date = new Date();
    var today = date.getDate();

    $scope.tableHeaders = [{
        title: 'NAME'
    }, {
        title: 'EMAIL'
    }, {
        title: 'CONTRASEÑA'
    }, {
        title: 'PERFIL'
    }];


    //Methods

    $scope.changeTab = function(tab) {
        if ($scope.tabSelected != tab) {
            $scope.tabSelected = tab;
        }
    }
$scope.profile = ''
    // Fetch data
    api.partner.getOne({
        id: $state.params.id,
        success: function(data) {
            console.log('AQUI AQUI AQUI');
            console.log(data);
            $scope.partner = data;
            // Fetch partner profile
            if(data.profile == null){
                $scope.profile = 'No definido';
            }else{
                api.profile.getOne({
                    params : name,
                    id : data.profile,
                    success : function(partnerProfile){
                        $scope.profile = partnerProfile.name;
                    },
                    error : function(error){}
                });
            }
            //GET PARTNERS FROM PARTNERS
            api.partner.getFromPartner({
                id: $scope.partner.id,
                success: function(data) {
                    console.log('-------partners-----')
                    console.log(data);
                    $scope.partners = data;
                    console.log('-------partners-----')
                },
                error: function(error) {
                    console.log(error);
                }
            });
            api.agent.getFromPartner({
                id: $scope.partner.id,
                success: function(data) {
                    console.log('-------agents-----')
                    console.log(data);
                    $scope.agents = data;
                    console.log('-------agents-----')
                },
                error: function(error) {
                    console.log(error);
                }
            });
        },
        error: function(error) {
            console.log(error);
        }
    });


    //Model
    // SI STATUS = 2 Y TERM = 0
    $scope.partnerActions = {
        form: {
            fields: {
                name: '',
                email: '',
                password: '',
                confirm: '',
                profile: null,
            },
            edit: function() {
                api.profile.getAll({
                    params: 'entity=1&id&name',
                    success: function(data) {
                        console.log(data);
                        $scope.profiles = data;
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })

                $scope.partnerActions.form.fields = {
                    name: $scope.partner.name,
                    email: $scope.partner.email,
                    password: $scope.partner.password,
                    confirm: $scope.partner.password,
                    profile: $scope.partner.profile
                }

                dialog.create({
                    "title": "Nuevo partner",
                    "body": "<div layout='row' layout-wrap>" +
                        '<md-input-container flex="100">' +
                        '<label>Nombre</label>' +
                        '<input ng-model="partnerActions.form.fields.name">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Email</label>' +
                        '<input ng-model="partnerActions.form.fields.email">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Contraseña</label>' +
                        '<input ng-model="partnerActions.form.fields.password">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Confirmar contraseña</label>' +
                        '<input ng-model="partnerActions.form.fields.confirm">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<md-select ng-model="partnerActions.form.fields.profile" placeholder="Selecciona un perfil">' +
                        '<md-option ng-value="{{profile.id}}" ng-repeat="profile in profiles">{{profile.name}}</md-option>' +
                        '</md-select>' +
                        '</md-input-container>' +
                        "</div>",
                    "data": "",
                    "buttons": [{
                        "text": "Guardar",
                        "action": "partnerActions.update"
                    }, {
                        "text": "Cancelar"
                    }]
                })
            },
            validate: function() {


                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.partnerActions.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.name == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Email, ';
                }
                if (form.password == '') {
                    error.count++;
                    error.message = error.message + 'Contraseña, ';
                }
                if (form.confirm == '') {
                    error.count++;
                    error.message = error.message + 'Confirmar contraseña, ';
                }

                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + ' .</p> '

                var testMail = re.test(form.email);

                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                if (form.password != form.confirm) {
                    error.count++;
                    error.message = error.message + '<p>Las contraseñas no coinciden.</p>';
                }

                if (error.count > 0) {
                    error.check = false;
                } else {
                    error.check = true;
                }

                return error;
            }
        },
        update: function() {
            $rootScope.coreDialog = null;
            var error = $scope.partnerActions.form.validate();
            if (error.check) {
                api.partner.update({
                    id: $scope.partner.id,
                    partner: $scope.partnerActions.form.fields,
                    success: function(data) {
                        console.log(data);
                        $timeout(function() {
                            $mdToast.showSimple('¡Datos del partner actualizados correctamente!');
                        }, 1000);
                        $scope.partner = window.mergeObj($scope.partner, $scope.partnerActions.form.fields);
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })
            } else {
                var confirm = $mdDialog.confirm()
                    .title('Formulario incompleto.')
                    .content(error.message)
                    .ok('Completar formulario')
                $mdDialog.show(confirm).then(function() {});
            }
        },
        disable: function() {
            var confirm = $mdDialog.confirm()
                .title('Inhabilitar partner')
                .content('Al confirmar esta acción bloqueas el acceso al partner y todos los agentes creados por el partner.  Ningún dato será eliminado y puedes reestablecer el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Bloquear compañía')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.partner.update({
                    id: $scope.partner.id,
                    partner: {
                        status: 3
                    },
                    success: function(data) {
                        $scope.partner.status = 3;
                        $timeout(function() {
                            $mdToast.showSimple('¡El partner ha sido Inhabilitado con éxito!');
                        }, 500);
                    },
                    error: function(error) {
                        $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                    }
                })
            }, function() {});
        },
        enable: function() {
            var confirm = $mdDialog.confirm()
                .title('Habilitar partner')
                .content('Al confirmar esta acción devuelves el acceso al partner y todos los agentes creados por el partner. Puedes volver a bloquear el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Desbloquear compañía')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.partner.update({
                    id: $scope.partner.id,
                    partner: {
                        status: 2
                    },
                    success: function(data) {
                        $scope.partner.status = 2;
                        $timeout(function() {
                            $mdToast.showSimple('¡El partner ha sido Habilitado con éxito!');
                        }, 500);
                    },
                    error: function(error) {
                        $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                    }
                })
            }, function() {});
        },
        delete: function() {
            var confirm = $mdDialog.confirm()
                .title('Eliminar partner.')
                .content('Al confirmar esta acción eliminas por completo a este partner, sus agentes y todos sus datos de manera irreversible, ¿Estás seguro que quieres continuar?')
                .ok('Eliminar compañía')
                .cancel('Regresar');

            $mdDialog.show(confirm).then(function() {
                api.partner.delete({
                    id: $scope.partner.id,
                    success: function(data) {
                        $state.go('main.partners');
                        $timeout(function() {
                            $mdToast.showSimple('¡El partner ha sido eliminado con éxito!');
                        }, 2000);
                    },
                    error: function(error) {
                        $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                    }
                })
            }, function() {});
        }
    }




    $scope.actions = [{
        icon: 'ion-edit',
        execute: $scope.partnerActions.form.edit,
        title: 'Editar'
    }, {
        icon: 'ion-ios-trash',
        execute: $scope.partnerActions.delete,
        title: 'Eliminar'
    }, {
        icon: 'ion-close-circled',
        execute: $scope.partnerActions.disable,
        title: 'Inhabilitar'
    }];


//check if access
if(!$rootScope.profile.partners.module){
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