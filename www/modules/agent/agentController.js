app.controller('agentController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, dialog, $mdDialog, $mdToast, $interval) {

    //Variables & defaults
    $scope.tabSelected = 1;
    $scope.total = 1000;

    var date = new Date();
    var today = date.getDate();

    $scope.tableHeaders = [{
        title: 'COMPAÑÍA'
    }, {
        title: 'PAÍS'
    }, {
        title: 'CORREO ELECTRÓNICO'
    }, {
        title: 'TELÉFONO'
    }, {
        title: 'PLAZO CUMPLIDO'
    }, {
        title: 'FECHA DE PAGO'
    }];

    //Methods

    $scope.changeTab = function(tab) {
        if ($scope.tabSelected != tab) {
            $scope.tabSelected = tab;
        }
    }
    $scope.profile = ''
    // Fetch data
    api.agent.getOne({
        id: $state.params.id,
        success: function(data) {
            console.log(data);
            $scope.agent = data;
            // Fetch agent profile
            if (data.profile == null) {
                $scope.profile = 'No definido';
            } else {
                api.profile.getOne({
                    params: name,
                    id: data.profile,
                    success: function(agentProfile) {
                        $scope.profile = agentProfile.name;
                    },
                    error: function(error) {}
                });
            }
            //GET CUSTOMERS CREATED BY AGENT
            api.customer.getFromPartner({
                id: $scope.agent.id,
                success: function(data) {
                    console.log(data);
                    $scope.customers = data;
                },
                error: function(error) {
                    console.log(error);
                }
            })
        },
        error: function(error) {
            console.log(error);
        }
    });


    //Model

    $scope.agentActions = {
        form: {
            fields: {
                name: '',
                email: '',
                password: '',
                confirm: '',
                profile: 0,
            },
            edit: function() {
                api.profile.getAll({
                    params: 'entity=2&id&name',
                    success: function(data) {
                        console.log(data);
                        $scope.profiles = data;
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })

                $scope.agentActions.form.fields = {
                    name: $scope.agent.name,
                    email: $scope.agent.email,
                    password: $scope.agent.password,
                    confirm: $scope.agent.password,
                    profile: $scope.agent.profile
                }

                dialog.create({
                    "title": "Nuevo agente",
                    "body": "<div layout='row' layout-wrap>" +
                        '<md-input-container flex="100">' +
                        '<label>Nombre</label>' +
                        '<input ng-model="agentActions.form.fields.name">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Email</label>' +
                        '<input ng-model="agentActions.form.fields.email">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Contraseña</label>' +
                        '<input ng-model="agentActions.form.fields.password">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Confirmar contraseña</label>' +
                        '<input ng-model="agentActions.form.fields.confirm">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<md-select ng-model="agentActions.form.fields.profile" placeholder="Selecciona un perfil">' +
                        '<md-option ng-value="{{profile.id}}" ng-repeat="profile in profiles">{{profile.name}}</md-option>' +
                        '</md-select>' +
                        '</md-input-container>' +
                        "</div>",
                    "data": "",
                    "buttons": [{
                        "text": "Guardar",
                        "action": "agentActions.update"
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

                var form = $scope.agentActions.form.fields;
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
            var error = $scope.agentActions.form.validate();
            if (error.check) {
                $rootScope.coreDialog = null;
                api.agent.update({
                    id: $scope.agent.id,
                    agent: $scope.agentActions.form.fields,
                    success: function(data) {
                        console.log(data);

                        $timeout(function() {
                            $mdToast.showSimple('¡Datos del agente actualizados correctamente!');
                        }, 1000);
                        $scope.agent = window.mergeObj($scope.agent, $scope.agentActions.form.fields);
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
                .title('Inhabilitar agente')
                .content('Al confirmar esta acción bloqueas el acceso al agente. aNingún dato será eliminado y puedes reestablecer el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Bloquear compañía')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.agent.update({
                    id: $scope.agent.id,
                    agent: {
                        status: 3
                    },
                    success: function(data) {
                        $scope.agent.status = 3;
                        $timeout(function() {
                            $mdToast.showSimple('¡El agente ha sido Inhabilitado con éxito!');
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
                .title('Habilitar agente')
                .content('Al confirmar esta acción devuelves el acceso al agente. Puedes volver a bloquear el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Desbloquear compañía')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.agent.update({
                    id: $scope.agent.id,
                    agent: {
                        status: 2
                    },
                    success: function(data) {
                        $scope.agent.status = 2;
                        $timeout(function() {
                            $mdToast.showSimple('¡El agente ha sido Habilitado con éxito!');
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
                .title('Eliminar agente.')
                .content('Al confirmar esta acción eliminas por completo a este agente de manera irreversible, ¿Estás seguro que quieres continuar?')
                .ok('Eliminar compañía')
                .cancel('Regresar');

            $mdDialog.show(confirm).then(function() {
                api.agent.delete({
                    id: $scope.agent.id,
                    success: function(data) {
                        $state.go('main.agents');
                        $timeout(function() {
                            $mdToast.showSimple('¡El agente ha sido eliminado con éxito!');
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
        execute: $scope.agentActions.form.edit,
        title: 'Editar'
    }, {
        icon: 'ion-ios-trash',
        execute: $scope.agentActions.delete,
        title: 'Eliminar'
    }, {
        icon: 'ion-close-circled',
        execute: $scope.agentActions.disable,
        title: 'Inhabilitar'
    }];


    //    $scope.users = [{
    //        name: 'Usuario',
    //        email: 'usuario@company.com',
    //        password: 'password',
    //        core: true,
    //        device: false,
    //        crm: true,
    //        helpdesk: true,
    //        project: false,
    //        learning: true
    //    }, {
    //        name: 'Usuario',
    //        email: 'usuario@company.com',
    //        password: 'password',
    //        core: true,
    //        device: false,
    //        crm: true,
    //        helpdesk: true,
    //        project: false,
    //        learning: true
    //    }, {
    //        name: 'Usuario',
    //        email: 'usuario@company.com',
    //        password: 'password',
    //        core: true,
    //        device: false,
    //        crm: true,
    //        helpdesk: true,
    //        project: true,
    //        learning: false
    //    }, {
    //        name: 'Usuario',
    //        email: 'usuario@company.com',
    //        password: 'password',
    //        core: true,
    //        device: true,
    //        crm: false,
    //        helpdesk: true,
    //        project: false,
    //        learning: true
    //    }];


    //check if access
    $timeout(function() {
        if (!$rootScope.profile.agents.module) {
            var none = true;
            if ($rootScope.profile.customers.module) {
                $state.go('main.customers');
                none = false;
            }
            if ($rootScope.profile.partners.module) {
                $state.go('main.partners');
                none = false;
            }
            if ($rootScope.profile.agents.module) {
                $state.go('main.agents');
                none = false;
            }
            if ($rootScope.profile.profiles.module) {
                $state.go('main.profiles');
                none = false;
            }
            if (none) {
                location.href = "http://www.pentcloud.com"
            }
        }
    }, 300);

});