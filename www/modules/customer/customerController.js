app.controller('customerController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, dialog, $mdDialog, $mdToast, $interval, randomPassword, md5) {

    //Variables & defaults
    $scope.tabSelected = 1;
    $scope.total = 0;
    $scope.subTab = 1;
    var productsLoaded = false;
    // api.customer.core.users.getLicenses({
    //     company : $scope.coreCompany.company,
    //     success: function(data) {
    //         alert('hey')
    //         console.log('-------------------------------------------------------------------')
    //         console.log('////////////////////////////////////////////////////////////////////')
    //         console.log(data);
    //         console.log('-------------------------------------------------------------------')
    //     },
    //     error: function(error) { alert('error')}
    // })



    $scope.changeSubTab = function(tab) {
        $scope.users = [];
        if ($scope.subTab != tab) {
            if (tab == 1) {
                api.customer.core.users.getAll({
                        company: $scope.coreCompany.company,
                        success: function(data) {
                            console.log('CORE USERS');
                            console.log(data);
                            $scope.users = data;
                            api.customer.core.users.getLicenses({
                                company: $scope.coreCompany.company,
                                success: function(data) {
                                    for (license in data) {
                                        for (user in $scope.users) {
                                            if (data[license].id == $scope.users[user].id) {
                                                $scope.users[user][getProductById(data[license].product)] = true;
                                            }
                                        }
                                    }
                                },
                                error: function(error) {
                                    $timeout(function() {
                                        $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo.');
                                    }, 500);
                                }
                            })
                            for(i in data){
                                try {
                                    var user = data[i];
                                    formattedPhone = JSON.parse(user.phone);
                                    if(user.phone[0]){
                                        formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                    }

                                } catch(err) {
                                    formattedPhone = [{ code : '', number : '' }];
                                }
                                user.phone = JSON.stringify(formattedPhone);
                            }
                        }
                    })
            } else {
                api.customer.device.users.getAll({
                    id: $scope.deviceCompany.company,
                    params: 'idUsuario id&nombre fname&apellido lname&email&telefono phone&password',
                    success: function(data) {
                        console.log(data);
                        $scope.usersDevice = data;
                        for(i in data){
                            try {
                                var user = data[i];
                                formattedPhone = JSON.parse(user.phone);
                                if(user.phone[0]){
                                    
                                    formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                }

                            } catch(err) {
                                
                                formattedPhone = [{ code : '', number : '' }];
                            }
                            user.phone = JSON.stringify(formattedPhone);
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })
            }
            $scope.subTab = tab;
        }
    }

    var date = new Date();
    var today = date.getDate();

    $scope.tableHeaders = [];

    var setCoreHeaders = function() {
        $scope.tableHeaders = [{
            title: 'Nombre'
        }, {
            title: 'Correo'
        }, {
            title: 'Teléfono'
        }, {
            title: 'Contraseña'
        }];
        if (productsLoaded) {
            console.log($scope.products);
            $interval.cancel(asyncHeaders);
            for (product in $scope.products) {
                if ($scope.products[product].licenses && $scope.products[product].licenses > 0 && $scope.products[product].id != 2) {
                    var header = {
                        title: '<img src="img/apps/' + $scope.products[product].id + '.png" class="iconHeader" title="Pentcloud {{header.tooltip}}"/>',
                        tooltip: $scope.products[product].name
                    }
                    $scope.tableHeaders.push(header);
                }
            }
            var actionsHeader = {
                title: 'Acciones'
            }
            $scope.tableHeaders.push(actionsHeader);
        }
    }
    var asyncHeaders = $interval(function() { //FOR ASYNC PURPOSES
        setCoreHeaders();
    }, 500)

    $scope.coreUsersConfig = function() {
        var err = 0;
        //VALIDACIÓN DE CANTIDAD DE LICENCIAS
        var activeLicenses = { core : { overdue : false, quantity : 0 }, device : { overdue : false, quantity : 0 }, crm : { overdue : false, quantity : 0 }, helpdesk : { overdue : false, quantity : 0 }, learning : { overdue : false, quantity : 0 }, project : { overdue : false, quantity : 0 } };
        for (user in $scope.users) {
            // products[0 2 3 4 5]
            if($scope.users[user].core){
                activeLicenses.core.quantity ++;
            }
            if($scope.users[user].crm){
                activeLicenses.crm.quantity ++;
            }
            if($scope.users[user].helpdesk){
                activeLicenses.helpdesk.quantity ++;
            }
            if($scope.users[user].learning){
                activeLicenses.learning.quantity ++;
            }
            if($scope.users[user].project){
                activeLicenses.project.quantity ++;
            }
        }
        
        if(activeLicenses.core.quantity > $scope.products[0].licenses){
            activeLicenses.core.overdue = true;
            // alert(activeLicenses.core.overdue);
        }
        if(activeLicenses.crm.quantity > $scope.products[2].licenses){
            activeLicenses.crm.overdue = true;
            // alert(activeLicenses.crm.overdue);
        }
        if(activeLicenses.helpdesk.quantity > $scope.products[3].licenses){
            activeLicenses.helpdesk.overdue = true;
        }
        if(activeLicenses.project.quantity > $scope.products[5].licenses){
            activeLicenses.project.overdue = true;
        }
        if(activeLicenses.learning.quantity > $scope.products[4].licenses){
            activeLicenses.learning.overdue = true;
        }

        console.log(activeLicenses);
        console.log($scope.products[4])
        

        if(activeLicenses.core.overdue || activeLicenses.crm.overdue || activeLicenses.helpdesk.overdue || activeLicenses.learning.overdue){
            $mdToast.showSimple('Has excedido tu límite de licencias disponible. Los cambios no se han guardado.');
        }else{

            

            for (user in $scope.users) {
                if ($scope.users[user].core) {
                    api.product.user.create({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 1
                        },
                        success: function() {},
                        error: function() {
                            err++
                        }
                    })
                } else {
                    api.product.user.delete({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 1
                        },
                        success: function() {},
                        error: function() {
                            err++
                        }
                    })
                }

                if ($scope.users[user].crm) {
                    api.product.user.create({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 3
                        },
                        success: function() {},
                        error: function() {
                            err++
                        }
                    })
                } else {
                    api.product.user.delete({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 3
                        },
                        success: function() {},
                        error: function() {}
                    })
                }

                if ($scope.users[user].helpdesk) {
                    api.product.user.create({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 4
                        },
                        success: function() {},
                        error: function() {}
                    })
                } else {
                    api.product.user.delete({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 4
                        },
                        success: function() {},
                        error: function() {}
                    })
                }

                if ($scope.users[user].learning) {
                    api.product.user.create({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 8
                        },
                        success: function() {},
                        error: function() {}
                    })
                } else {
                    api.product.user.delete({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 8
                        },
                        success: function() {},
                        error: function() {}
                    })
                }

                if ($scope.users[user].project) {
                    api.product.user.create({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 9
                        },
                        success: function() {},
                        error: function() {}
                    })
                } else {
                    api.product.user.delete({
                        user_product: {
                            user: $scope.users[user].id,
                            product: 9
                        },
                        success: function() {},
                        error: function() {
                            err++
                        }
                    })
                }
            }

            if (err > 0) {
                $timeout(function() {
                    $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo.');
                }, 500);
            } else {
                $timeout(function() {
                    $mdToast.showSimple('Licencias agregadas con éxito.');
                }, 500);
            }
        }
    } //fin de check de licenses

    

    $scope.tableHeadersDevice = [{
        title: 'Nombre'
    }, {
        title: 'Correo'
    }, {
        title: 'Teléfono'
    }, {
        title: 'Contraseña'
    }
    ,
    {
        title: 'Acciones'
    }
    ];



    //Methods

    $scope.changeTab = function(tab) {
        api.customer.productCompany.getOne({
            customer: $scope.customer.id,
            product: 1,
            success: function(data) {
                $scope.coreCompany = data;
                api.customer.device.users.getAll({
                    id: $scope.deviceCompany.company,
                    params: 'idUsuario id&nombre fname&apellido lname&email&telefono phone&password',
                    success: function(data) {
                        console.log(data);
                        $scope.usersDevice = data;
                        for(i in data){
                            try {
                                var user = data[i];
                                formattedPhone = JSON.parse(user.phone);
                                if(user.phone[0]){
                                    
                                    formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                }

                            } catch(err) {
                                
                                formattedPhone = [{ code : '', number : '' }];
                            }
                            user.phone = JSON.stringify(formattedPhone);
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })
                api.customer.core.users.getAll({
                        company: $scope.coreCompany.company,
                        success: function(data) {
                            console.log('CORE USERS');
                            console.log(data);
                            $scope.users = data;
                            api.customer.core.users.getLicenses({
                                company: $scope.coreCompany.company,
                                success: function(data) {
                                    for (license in data) {
                                        for (user in $scope.users) {
                                            if (data[license].id == $scope.users[user].id) {
                                                $scope.users[user][getProductById(data[license].product)] = true;
                                            }
                                        }
                                    }
                                },
                                error: function(error) {
                                    $timeout(function() {
                                        $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo.');
                                    }, 500);
                                }
                            })
                            for(i in data){
                                try {
                                    var user = data[i];
                                    formattedPhone = JSON.parse(user.phone);
                                    if(user.phone[0]){
                                        formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                    }

                                } catch(err) {
                                    formattedPhone = [{ code : '', number : '' }];
                                }
                                user.phone = JSON.stringify(formattedPhone);
                            }
                        }
                    })
            },
            error: function() {}
        });
        setCoreHeaders();
        if ($scope.tabSelected != tab) {
            $scope.tabSelected = tab;
        }
        $timeout(function() {

        })
    }

    // Fetch data
    api.customer.getOne({
        id: $state.params.id,
        success: function(data) {
            console.log(data);
            $scope.customer = data;

            // Fetch customer profile
            if (data.profile == null) {
                $scope.profile = 'No definido';
            } else {
                api.profile.getOne({
                    params: name,
                    id: data.profile,
                    success: function(customerProfile) {
                        $scope.profile = customerProfile.name;
                    },
                    error: function(error) {}
                });
            }

            // Fetch current licenses
            api.license.getAll({
                id: $scope.customer.id,
                success: function(licenses) {
                    $scope.licenses = licenses;
                    api.product.getAll({
                        params: 'Nombre name&Descripcion description&icono icon&idProducto id&Tarifa price&0 licenses',
                        success: function(products) {
                            //Match licences with products
                            for (ii = 0; ii < products.length; ii++) {
                                for (i = 0; i < licenses.length; i++) {
                                    if (products[ii].id == licenses[i].product) {
                                        products[ii].licenses = licenses[i].quantity;
                                    }
                                }
                            }
                            $scope.products = products;
                            $rootScope.products = products;
                            productsLoaded = true;
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                },
                error: function(error) {
                    console.log(error)
                }
            })
            // Fetch specific product data
            api.customer.productCompany.getOne({
                customer: $scope.customer.id,
                product: 2,
                success: function(data) {
                    $scope.deviceCompany = data;
                    console.log('deviceCompany');
                    console.log(data);
                },
                error: function(error) {
                    console.log(error);
                }
            })
            api.customer.productCompany.getOne({
                customer: $scope.customer.id,
                product: 1,
                success: function(data) {
                    $scope.coreCompany = data;
                    console.log('coreCompany');
                    console.log(data);
                    // Fetch core users
                    api.customer.core.users.getAll({
                        company: $scope.coreCompany.company,
                        success: function(data) {
                            console.log('CORE USERS');
                            console.log(data);
                            $scope.users = data;
                            api.customer.core.users.getLicenses({
                                company: $scope.coreCompany.company,
                                success: function(data) {
                                    for (license in data) {
                                        for (user in $scope.users) {
                                            if (data[license].id == $scope.users[user].id) {
                                                $scope.users[user][getProductById(data[license].product)] = true;
                                            }
                                        }
                                    }
                                },
                                error: function(error) {
                                    $timeout(function() {
                                        $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo.');
                                    }, 500);
                                }
                            })
                            for(i in data){
                                try {
                                    var user = data[i];
                                    formattedPhone = JSON.parse(user.phone);
                                    if(user.phone[0]){
                                        formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                    }

                                } catch(err) {
                                    formattedPhone = [{ code : '', number : '' }];
                                }
                                user.phone = JSON.stringify(formattedPhone);
                            }
                        }
                    })
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
    var getProductById = function(id) {
        var products = [{
            id: 1,
            name: 'core'
        }, {
            id: 3,
            name: 'crm'
        }, {
            id: 4,
            name: 'helpdesk'
        }, {
            id: 8,
            name: 'learning'
        }, {
            id: 9,
            name: 'project'
        }];
        for (product in products) {
            if (products[product].id == id) {
                return products[product].name;
            }
        }
    }

    //get total
    $scope.$watch('products', function() {
        $scope.total = 0;
        if($rootScope.partnerPricing){
            for (i = 0; i < $scope.products.length; i++) {
                var add = $scope.products[i].licenses * $rootScope.partnerPricing.prices[i]
                if(add){
                    $scope.total += add;
                }
            }
        }else{
            for (i = 0; i < $scope.products.length; i++) {
                $scope.total += $scope.products[i].licenses * $scope.products[i].price;
            }
        };
    }, true);

    //======NG ENTERS=======//
    //======NEW USER CORE=======//

    $scope.focusLname = function() {
        if ($scope.newUser.form.fields.fname != '') {
            angular.element('#newUserLname').focus();
        }
    }

    $scope.focusEmail = function() {
        if ($scope.newUser.form.fields.lname != '') {
            angular.element('#newUserEmail').focus();
        }
    }

    $scope.focusPhone = function() {
        if ($scope.newUser.form.fields.email != '') {
            angular.element('#newUserPhone').focus();
        }
    }

    $scope.focusArea = function() {
        if ($scope.newUser.form.fields.email != '') {
            angular.element('#newUserArea').focus();
        }
    }

    $scope.executeCreateUser = function() {
        if ($scope.newUser.form.fields.phone != '') {
            $scope.newUser.create();
        }
    }
    //======NEW USER CORE=======//

    //======NEW USER DEVICE=======//

    $scope.focusDeviceLname = function() {
        if ($scope.newUserDevice.form.fields.fname != '') {
            angular.element('#newUserDeviceLname').focus();
        }
    }

    $scope.focusDeviceEmail = function() {
        if ($scope.newUserDevice.form.fields.lname != '') {
            angular.element('#newUserDeviceEmail').focus();
        }
    }

    $scope.focusDeviceArea = function() {
        if ($scope.newUserDevice.form.fields.email != '') {
            angular.element('#newUserDeviceArea').focus();
        }
    }

    $scope.focusDevicePhone = function() {
        if ($scope.newUserDevice.form.fields.email != '') {
            angular.element('#newUserDevicePhone').focus();
        }
    }

    $scope.executeCreateUserDevice = function() {
        if ($scope.newUserDevice.form.fields.phone != '') {
            $scope.newUserDevice.create();
        }
    }
    //======NEW USER DEVICE=======//

    //======NG ENTERS USER=======//

    //===NEW USER=======//
    $scope.newUser = {
        form: {
            fields: {
                fname: '',
                lname: '',
                email: '',
                phone: { code : '', number : '' }
            },
            validate: function(callback) {
                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.newUser.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.fname == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.lname == '') {
                    error.count++;
                    error.message = error.message + 'Apellido, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Correo, ';
                }
                if (form.phone.code == '') {
                    error.count++;
                    error.message = error.message + 'Area, ';
                }
                if (form.phone.number == '') {
                    error.count++;
                    error.message = error.message + 'Teléfono, ';
                }



                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + ' .</p> '

                var testMail = re.test(form.email);

                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                for (user in $scope.users) {
                    if ($scope.users[user].email == $scope.newUser.form.fields.email) {
                        error.count++;
                        error.message = '<p>Usuario ya existe en bd</p>'
                    }
                }

                if (error.count > 0) {
                    error.check = false;
                } else {
                    error.check = true;
                }

                callback(error);
            }
        },
        create: function() {

            $scope.newUser.form.validate(function(form) {
                if (form.check) {
                    // md5
                    // $scope.newUser.form.fields.password = md5.createHash(randomPassword());
                    $scope.newUser.form.fields.password = randomPassword();

                    api.customer.core.users.create({
                        user: {
                            "username": $scope.newUser.form.fields.email,
                            "password": $scope.newUser.form.fields.password,
                            "firstname": $scope.newUser.form.fields.fname,
                            "lastname": $scope.newUser.form.fields.lname,
                            "birthday": "",
                            "icon": "",
                            "idstate": 1,
                            "job": "",
                            "detail": "",
                            "cover": "",
                            "wizards": "[]",
                            "address": "",
                            "phones": JSON.stringify([$scope.newUser.form.fields.phone]),
                            "idcompany": $scope.coreCompany.company,
                            "product": "1",
                            "idnetwork": 0,
                            "company": $scope.coreCompany.company,
                            "newuser": true
                        },
                        success: function(data) {
                            if (data.status && data.status == 600) {
                                //                                alert('usuario duplicado en base de datos')
                                var confirm = $mdDialog.confirm()
                                    .title('Usuario duplicado.')
                                    .content('Esta dirección de correo ya existe, por favor intenta con otra dirección de correo')
                                    .ok('Aceptar')
                                $mdDialog.show(confirm).then(function() {});
                            } else {
                                $scope.newUser.form.fields.id = data.value.id
                                $scope.users.unshift($scope.newUser.form.fields);
                                $scope.newUser.form.fields = {
                                    fname: "",
                                    lname: "",
                                    email: "",
                                    phone: ""
                                }
                                angular.element('#newUserFname').focus();
                            }
                            $timeout(function() {
                                $timeout(function() {
                                    $mdToast.showSimple('¡Usuario creado correctamente!');
                                }, 1000)
                            }, 1000)
                        }
                    })

                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Formulario incompleto.')
                        .content(form.message)
                        .ok('Completar formulario')
                    $mdDialog.show(confirm).then(function() {});
                }
            });
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
    //===/NEW USER=======//
    //===EDIT USER=======//
    var tmpEditUser = ""; // guarda temporalmente el email a editar para comparar con emil final
    $scope.editUser = {
        form: {
            fields: {
                fname: '',
                lname: '',
                email: '',
                phone: '',
                password: ''
            },
            edit: function(input) {
                user = window.cloneObj(input);
                console.log('COREUSER')
                console.log('COREUSER')
                console.log('COREUSER')
                console.log(user)
                console.log('COREUSER')

                tmpEditUser = user.email;

                var formattedPhone;

                try {
                    formattedPhone = JSON.parse(user.phone);
                    if(user.phone[0]){
                        formattedPhone = { code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number }
                    }
                } catch(err) {
                    formattedPhone = [{ code : '', number : '' }];
                }

                $scope.editUser.form.fields = {
                    id : user.id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    phone: formattedPhone,
                    password: user.pass
                }

                dialog.create({
                    "title": "Editar usuario",
                    "body": "<div layout='row' layout-wrap>" +
                        '<md-input-container flex="100" >' +
                        '<label>Nombre</label>' +
                        '<input ng-model="editUser.form.fields.fname">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100" >' +
                        '<label>Apellido</label>' +
                        '<input ng-model="editUser.form.fields.lname">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100" ng-if="customer.email != editUser.form.fields.email">' +
                        '<label>Correo</label>' +
                        '<input ng-model="editUser.form.fields.email">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Área</label>' +
                        '<input ng-model="editUser.form.fields.phone.code">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100" >' +
                        '<label>Teléfono</label>' +
                        '<input ng-model="editUser.form.fields.phone.number">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100" ng-if="editUser.form.fields.password != \'\'">' +
                        '<label>Contraseña</label>' +
                        '<input ng-model="editUser.form.fields.password">' +
                        '</md-input-container>' +
                        "</div>",
                    "data": "",
                    "buttons": [{
                        "text": "Guardar",
                        "action": "editUser.update"
                    }, {
                        "text": "Cancelar"
                    }]
                })
            },
            validate: function(callback) {
                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.editUser.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.fname == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.lname == '') {
                    error.count++;
                    error.message = error.message + 'Apellido, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Correo, ';
                }
                if (form.phone.code == '') {
                    error.count++;
                    error.message = error.message + 'Area, ';
                }
                if (form.phone.number == '') {
                    error.count++;
                    error.message = error.message + 'Teléfono, ';
                }
                
                if (form.password == '') {
                    error.count++;
                    error.message = error.message + 'Contraseña, ';
                }

                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + ' .</p> '

                var testMail = re.test(form.email);

                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                for (user in $scope.users) {
                    if ($scope.users[user].email == $scope.editUser.form.fields.email && $scope.users[user].email != tmpEditUser) {
                        error.count++;
                        error.message = '<p>Usuario ya existe en bd</p>'
                    }
                }
                if (error.count > 0) {
                    error.check = false;
                } else {
                    error.check = true;
                }
                callback(error);
            }
        },
        update: function() {
            $scope.editUser.form.validate(function(error) {
                if (error.check) {
                    $scope.editUser.form.fields.phone = JSON.stringify([$scope.editUser.form.fields.phone]);
                    $rootScope.coreDialog = null;
                    for(i in $scope.users){
                        if($scope.users[i].id === $scope.editUser.form.fields.id){
                            $scope.editUser.form.fields.pass = $scope.editUser.form.fields.password;
                            window.mergeObj($scope.users[i], $scope.editUser.form.fields);
                        }
                    }
                    api.customer.core.users.update({
                        user : $scope.editUser.form.fields,
                        success: function(data) {
                            $timeout(function() {
                                $mdToast.showSimple('¡Usuario editado correctamente!');
                            }, 1000)
                        },
                        error: function(error) {
                            console.log(error);
                            $timeout(function() {
                                $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo más tarde.');
                            }, 500);
                        }
                    })
                } else {
                    var confirm = $mdDialog.confirm()
                        .title('Formulario incompleto.')
                        .content(error.message)
                        .ok('Completar formulario')
                    $mdDialog.show(confirm).then(function() {});
                }

            });
        }
    }
    //===/EDIT USER=======//

    //===NEW USER DEVICE=======//
    $scope.newUserDevice = {
        form: {
            fields: {
                fname: '',
                lname: '',
                email: '',
                phone: { code : '', number : '' }
            },
            validate: function(callback) {
                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.newUserDevice.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.fname == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.lname == '') {
                    error.count++;
                    error.message = error.message + 'Apellido, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Correo, ';
                }
                if (form.phone.code == '') {
                    error.count++;
                    error.message = error.message + 'Area, ';
                }
                if (form.phone.number == '') {
                    error.count++;
                    error.message = error.message + 'Teléfono, ';
                }

                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + ' .</p> '

                var testMail = re.test(form.email);

                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                // $scope.users = data;
                for (user in $scope.usersDevice) {
                    if ($scope.usersDevice[user].email == $scope.newUserDevice.form.fields.email) {
                        error.count++;
                        error.message = '<p>Usuario ya existe en bd</p>'
                    }
                }

                if (error.count > 0) {
                    error.check = false;
                } else {
                    error.check = true;
                }
                callback(error);

            }
        },
        create: function() {

            $scope.newUserDevice.form.validate(function(form) {
                if (form.check) {
                    // var newUser = nombre, apellido, password, idEmpresa, email, telefono
                    var newDeviceUser = {
                        fname: $scope.newUserDevice.form.fields.fname,
                        lname: $scope.newUserDevice.form.fields.lname,
                        password: $scope.newUserDevice.form.fields.password,
                        company: $scope.deviceCompany.company,
                        email: $scope.newUserDevice.form.fields.email,
                        phone: JSON.stringify([$scope.newUserDevice.form.fields.phone]),
                        password: randomPassword()
                    }

                    api.customer.device.users.create({
                        user: newDeviceUser,
                        success: function(data) {

                            if (data.status && data.status == 600) {
                                //                                alert('usuario duplicado en base de datos')
                                var confirm = $mdDialog.confirm()
                                    .title('Usuario duplicado.')
                                    .content('Esta dirección de correo ya existe, por favor intenta con otra dirección de correo')
                                    .ok('Aceptar')
                                $mdDialog.show(confirm).then(function() {});
                            } else {
                                //aqui va license de device
                                api.product.user.create({
                                    user_product: {
                                        user: data.id,
                                        product: 2
                                    },
                                    success: function(data) {
                                        api.customer.device.users.getAll({
                                            id: $scope.deviceCompany.company,
                                            params: 'idUsuario id&nombre fname&apellido lname&email&telefono phone&password',
                                            success: function(data) {
                                                console.log(data);
                                                $scope.usersDevice = data;
                                                for(i in data){
                                                    try {
                                                        var user = data[i];
                                                        formattedPhone = JSON.parse(user.phone);
                                                        if(user.phone[0]){
                                                            
                                                            formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                                        }

                                                    } catch(err) {
                                                        
                                                        formattedPhone = [{ code : '', number : '' }];
                                                    }
                                                    user.phone = JSON.stringify(formattedPhone);
                                                }
                                            },
                                            error: function(error) {
                                                console.log(error);
                                            }
                                        })
                                    },
                                    error: function(error) {}
                                })
                                $scope.usersDevice.unshift(data);
                                $scope.newUserDevice.form.fields = {
                                    fname: "",
                                    lname: "",
                                    email: "",
                                    phone: ""
                                }
                                angular.element('#newUserDeviceFname').focus();
                                $timeout(function() {
                                    $timeout(function() {
                                        $mdToast.showSimple('¡Usuario creado correctamente!');
                                    }, 1000)
                                }, 1000)
                            }
                        },
                        error: function(error) {
                            console.log(error);
                            $timeout(function() {
                                $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo más tarde.');
                            }, 500);
                        }
                    })

                } else {
                    //                    alert(form.message);
                    var confirm = $mdDialog.confirm()
                        .title('Formulario incompleto.')
                        .content(form.message)
                        .ok('Completar formulario')
                    $mdDialog.show(confirm).then(function() {});
                }

            });
        },
        disable: function() {
            var confirm = $mdDialog.confirm()
                .title('Inhabilitar agente')
                .content('Al confirmar esta acción bloqueas el acceso al agente. Ningún dato será eliminado y puedes reestablecer el acceso en cualquier momento utilizando este mismo botón.')
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
        delete: function(user) {
            var confirm = $mdDialog.confirm()
                .title('Eliminar usuario.')
                .content('Al confirmar esta acción eliminas por completo a este usuario y todos sus datos de manera irreversible, ¿Estás seguro que quieres continuar?')
                .ok('Eliminar usuario')
                .cancel('Regresar');

            $mdDialog.show(confirm).then(function() {
                api.customer.device.users.delete({
                    id: user.id,
                    success: function(data) {
                        $timeout(function() {
                            $mdToast.showSimple('¡El usuario ha sido eliminado con éxito!');
                            api.customer.device.users.getAll({
                                id: $scope.deviceCompany.company,
                                params: 'idUsuario id&nombre fname&apellido lname&email&telefono phone&password',
                                success: function(data) {
                                    console.log(data);
                                    $scope.usersDevice = data;
                                    for(i in data){
                                        try {
                                            var user = data[i];
                                            formattedPhone = JSON.parse(user.phone);
                                            if(user.phone[0]){
                                                formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                            }

                                        } catch(err) {
                                            formattedPhone = [{ code : '', number : '' }];
                                        }
                                        user.phone = JSON.stringify(formattedPhone);
                                    }
                                },
                                error: function(error) {
                                    console.log(error);
                                }
                            })
                        }, 2000);
                    },
                    error: function(error) {
                        $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                    }
                })
            }, function() {});
        }
    }
    //===/NEW USER DEVICE=======//
    //===EDIT USER DEVICE=======//
    var tmpEditUserDevice = ""; // guarda temporalmente el email a editar para comparar con emil final
    $scope.editUserDevice = {
        form: {
            fields: {
                fname: '',
                lname: '',
                email: '',
                phone: '',
                password: ''
            },
            edit: function(input) {
                user = window.cloneObj(input);

                tmpEditUserDevice = user.email;

                var formattedPhone;
                try {
                    formattedPhone = JSON.parse(user.phone);
                    if(user.phone[0]){
                        formattedPhone = { code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }
                    }

                } catch(err) {
                    formattedPhone = [{ code : '', number : '' }];
                }

                $scope.editUserDevice.form.fields = {
                    id : user.id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    phone: formattedPhone,
                    password: user.pass
                }

                dialog.create({
                    "title": "Editar usuario",
                    "body": "<div layout='row' layout-wrap>" +
                        '<md-input-container flex="100">' +
                        '<label>Nombre</label>' +
                        '<input ng-model="editUserDevice.form.fields.fname">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Apellido</label>' +
                        '<input ng-model="editUserDevice.form.fields.lname">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Correo</label>' +
                        '<input ng-model="editUserDevice.form.fields.email">' +
                        '</md-input-container>' +
                        '<md-input-container flex="30">' +
                        '<label>Área</label>' +
                        '<input ng-model="editUserDevice.form.fields.phone.code">' +
                        '</md-input-container>' +
                        '<md-input-container flex="70">' +
                        '<label>Teléfono</label>' +
                        '<input ng-model="editUserDevice.form.fields.phone.number">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Contraseña</label>' +
                        '<input ng-model="editUserDevice.form.fields.password">' +
                        '</md-input-container>' +
                        "</div>",
                    "data": "",
                    "buttons": [{
                        "text": "Guardar",
                        "action": "editUserDevice.update"
                    }, {
                        "text": "Cancelar"
                    }]
                })
            },
            validate: function(callback) {
                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.editUserDevice.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.fname == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.lname == '') {
                    error.count++;
                    error.message = error.message + 'Apellido, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Correo, ';
                }
                if (form.password == '') {
                    error.count++;
                    error.message = error.message + 'Contraseña, ';
                }

                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + ' .</p> '

                var testMail = re.test(form.email);

                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }

                for (user in $scope.users) {
                    if ($scope.users[user].email == $scope.editUserDevice.form.fields.email && $scope.users[user].email != tmpEditUserDevice) {
                        error.count++;
                        error.message = '<p>Usuario ya existe en bd</p>'
                    }
                }
                if (error.count > 0) {
                    error.check = false;
                } else {
                    error.check = true;
                }
                callback(error);
            }
        },
        update: function() {
            $scope.editUserDevice.form.validate(function(form) {
                if (form.check) {
                    $scope.editUserDevice.form.fields.phone = JSON.stringify([$scope.editUserDevice.form.fields.phone]);
                    $rootScope.coreDialog = null;
                    for(i in $scope.usersDevice){
                        if($scope.usersDevice[i].id === $scope.editUserDevice.form.fields.id){
                            $scope.editUserDevice.form.fields.pass = $scope.editUserDevice.form.fields.password;
                            window.mergeObj($scope.usersDevice[i], $scope.editUserDevice.form.fields);
                        }
                    }
                    api.customer.device.users.update({
                        user : $scope.editUserDevice.form.fields,
                        success: function(data) {
                            $timeout(function() {
                                $mdToast.showSimple('¡Usuario editado correctamente!');
                            }, 1000)
                        },
                        error: function(error) {
                            console.log(error);
                            $timeout(function() {
                                $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo más tarde.');
                            }, 500);
                        }
                    })
                } else {
                    // alert(form.message);
                    var confirm = $mdDialog.confirm()
                        .title('Formulario incompleto.')
                        .content(form.message)
                        .ok('Completar formulario')
                    $mdDialog.show(confirm).then(function() {});
                }
            });
        }
    }
    //===/EDIT USER DEVICE=======//

    //Model
    // SI STATUS = 2 Y TERM = 0
    $scope.customerActions = {
        form: {
            fields: {
                name: "",
                email: "",
                password: "",
                address: "",
                phone: "",
                zip: "",
                country: "",
                city: "",
                language: "",
                profile: "",
                deadline: 0,
                term: 0
            },
            edit: function() {
                api.profile.getAll({
                    params: 'entity=3&id&name',
                    success: function(data) {
                        console.log(data);
                        $scope.profiles = data;
                    },
                    error: function(error) {
                        console.log(error);
                    }
                })
                $scope.customerActions.form.fields = {
                    name: $scope.customer.name,
                    email: $scope.customer.email,
                    password: $scope.customer.password,
                    address: $scope.customer.address,
                    phone: $scope.customer.phone,
                    zip: $scope.customer.zip,
                    country: $scope.customer.country,
                    city: $scope.customer.city,
                    language: $scope.customer.language,
                    profile: $scope.customer.profile,
                    deadline: $scope.customer.deadline,
                    term: $scope.customer.term
                }
                dialog.create({
                    "title": "Nuevo cliente",
                    "body": "<div layout='row' layout-wrap>" +
                        '<md-input-container flex="100">' +
                        '<label>Nombre</label>' +
                        '<input ng-model="customerActions.form.fields.name">' +
                        '</md-input-container>' +
                        // '<md-input-container flex="50">' +
                        // '<label>Email</label>' +
                        // '<input ng-model="customerActions.form.fields.email">' +
                        // '</md-input-container>' +
                        // '<md-input-container flex="50">' +
                        // '<label>Password</label>' +
                        // '<input ng-model="customerActions.form.fields.password">' +
                        // '</md-input-container>' +
                        // '<md-input-container flex="50">' +
                        // '<label>Confirmar password</label>' +
                        // '<input ng-model="customerActions.form.fields.confirm">' +
                        // '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<label>Dirección</label>' +
                        '<input ng-model="customerActions.form.fields.address">' +
                        '</md-input-container>' +
                        '<md-input-container flex="50">' +
                        '<label>Teléfono</label>' +
                        '<input ng-model="customerActions.form.fields.phone">' +
                        '</md-input-container>' +
                        '<md-input-container flex="50">' +
                        '<label>Código postal</label>' +
                        '<input ng-model="customerActions.form.fields.zip">' +
                        '</md-input-container>' +
                        '<md-input-container flex="50">' +
                        '<label>País</label>' +
                        '<input ng-model="customerActions.form.fields.country">' +
                        '</md-input-container>' +
                        '<md-input-container flex="50">' +
                        '<label>Ciudad</label>' +
                        '<input ng-model="customerActions.form.fields.city">' +
                        '</md-input-container>' +
                        '<md-input-container flex="100">' +
                        '<md-select ng-model="customerActions.form.fields.language" placeholder="Selecciona un idioma">' +
                        '<md-option value="es">Español</md-option>' +
                        '<md-option value="en">Inglés</md-option>' +
                        '</md-select>' +
                        '</md-input-container>' +
                    //                        '<md-input-container flex="50">' +
                    //                        '<md-select ng-model="customerActions.form.fields.profile" placeholder="Selecciona un perfil">' +
                    //                        '<md-option ng-value="{{profile.id}}" ng-repeat="profile in profiles">{{profile.name}}</md-option>' +
                    //                        '</md-select>' +
                    //                        '</md-input-container>' +
                    '<md-input-container flex="50" ng-if="(customer.status == 2 || customer.status == 3) && customer.term == 0">' +
                        '<label>Fecha de pago</label>' +
                        '<input ng-model="customerActions.form.fields.deadline" type="number">' +
                        '</md-input-container>' +
                        '<md-input-container flex="50" ng-if="(customer.status == 2 || customer.status == 3) && customer.term == 0">' +
                        '<label>Plazo de contrato (meses)</label>' +
                        '<input ng-model="customerActions.form.fields.term" type="number">' +
                        '</md-input-container>' +
                        "</div>",
                    "data": "",
                    "buttons": [{
                        "text": "Guardar",
                        "action": "customerActions.update"
                    }, {
                        "text": "Cancelar"
                    }]
                })
            },
            validate: function(edit) {

                var error = {
                    count: 0,
                    message: "<p>Debe llenar los siguientes campos:</p><p>",
                    check: false
                }

                var form = $scope.customerActions.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if (form.name == '') {
                    error.count++;
                    error.message = error.message + 'Nombre, ';
                }
                if (form.email == '') {
                    error.count++;
                    error.message = error.message + 'Email, ';
                }
                if (form.address == '') {
                    error.count++;
                    error.message = error.message + 'Dirección, ';
                }
                if (form.phone == '') {
                    error.count++;
                    error.message = error.message + 'Teléfono, ';
                }
                if (form.zip == '') {
                    error.count++;
                    error.message = error.message + 'Código Postal, ';
                }
                if (form.country == '') {
                    error.count++;
                    error.message = error.message + 'País, ';
                }
                if (form.city == '') {
                    error.count++;
                    error.message = error.message + 'Ciudad, ';
                }
                if (form.language == '') {
                    error.message = error.message + 'Idioma, ';
                    error.count++;
                }
                // Trim string
                error.message = error.message.substring(0, error.message.length - 2) + '.</p>'

                var testMail = re.test(form.email);
                if (!testMail) {
                    error.count++;
                    error.message = error.message + '<p>Ingresa un Email válido.</p>';
                }
                 if(!edit){
                    if (form.password == '') {
                        error.count++;
                        error.message = error.message + 'Password, ';
                    }
                    if (form.password == '') {
                        error.count++;
                        error.message = error.message + 'Confirmar password, ';
                    }
                    if (form.password != form.confirm) {
                        error.count++;
                        error.message = error.message + '<p>Las contraseñas no coinciden.</p>';
                    }
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
            // dialog.destroy();

            var error = $scope.customerActions.form.validate(true);
            if (error.check) {
                $rootScope.coreDialog = null;
                api.customer.update({
                    id: $scope.customer.id,
                    customer: $scope.customerActions.form.fields,
                    success: function(data) {
                        console.log(data);
                        $timeout(function() {
                            $mdToast.showSimple('¡Datos del cliente actualizados correctamente!');
                        }, 1000);
                        $scope.customer = window.mergeObj($scope.customer, $scope.customerActions.form.fields);
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
                .title('Inhabilitar cliente')
                .content('Al confirmar esta acción bloqueas el acceso al administrador y todos los usuarios de esta compañía.  Ningún dato será eliminado y puedes reestablecer el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Inhabilitar cliente')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.customer.update({
                    id: $scope.customer.id,
                    customer: {
                        status: 3
                    },
                    success: function(data) {
                        $scope.customer.status = 3;
                        $timeout(function() {
                            $mdToast.showSimple('¡El cliente ha sido Inhabilitado con éxito!');
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
                .title('Habilitar cliente')
                .content('Al confirmar esta acción devuelves el acceso al administrador y todos los usuarios de esta compañía. Puedes volver a bloquear el acceso en cualquier momento utilizando este mismo botón.')
                .ok('Habilitar cliente')
                .cancel('Regresar');
            $mdDialog.show(confirm).then(function() {
                api.customer.update({
                    id: $scope.customer.id,
                    customer: {
                        status: 2
                    },
                    success: function(data) {
                        $scope.customer.status = 2;
                        $timeout(function() {
                            $mdToast.showSimple('¡El cliente ha sido Habilitado con éxito!');
                        }, 500);
                    },
                    error: function(error) {
                        $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                    }
                })
            }, function() {});
        },
        activation: function() {
            var licensingProcess = {
                done: 0,
                steps: 0,
                activate: function() {
                    var confirm = $mdDialog.confirm()
                        .title('Activar cliente')
                        .content('<div layout="row" layout-wrap><p flex="100">Ingresa el día en que se vencerá la fecha de pago correspondiente a cada mes:</p><input flex="100" type="number" ng-model="$root.tmpCustomer.deadline"/><p flex="100">Ingresa la cantidad de meses deseados de servicio:</p><input <input flex="100" type="number" ng-model="$root.tmpCustomer.term"/><p flex="100" >Al continuar se emitirá la primer factura correspondiente a los productos y licencias detallados en la sección anterior.  A partir de esta confirmación el usuario podrá acceder a su cuenta.</p></div>')
                        .ok('Continuar')
                        .cancel('Regresar');
                    $mdDialog.show(confirm).then(function() {

                        if (!$rootScope.tmpCustomer) {
                            $rootScope.tmpCustomer = {
                                deadline: 0,
                                term: 0
                            }
                        } else {
                            if (!$rootScope.tmpCustomer.deadline) {
                                $rootScope.tmpCustomer.deadline = 0
                            }
                            if (!$rootScope.tmpCustomer.term) {
                                $rootScope.tmpCustomer.term = 0
                            }
                        }

                        var ok = true;

                        $scope.customer.deadline = $rootScope.tmpCustomer.deadline;
                        $scope.customer.term = $rootScope.tmpCustomer.term;

                        if ($scope.customer.deadline == 0 || $scope.customer.deadline == '' || $scope.customer.deadline > 31 || $scope.customer.term < 1) {
                            ok = false;
                        }
                        if ($scope.customer.term == 0 || $scope.customer.term == '' || $scope.customer.term < 1) {
                            ok = false;
                        }
                        if ($scope.total == 0) {
                            ok = false;
                        }

                        if (ok) {
                            delete $rootScope.tmpCustomer;
                            api.customer.update({
                                id: $scope.customer.id,
                                customer: {
                                    status: 2,
                                    deadline: $scope.customer.deadline,
                                    term: $scope.customer.term
                                },
                                success: function(data) {
                                    $scope.customer.status = 2;
                                    licensingProcess.done++;
                                    // $mdToast.showSimple('Paso '+licensingProcess.done+' de '+licensingProcess.steps+': ¡El cliente ha sido Habilitado con éxito!');
                                    licensingProcess.bill();
                                },
                                error: function(error) {
                                    $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo nuevamente más tarde.');
                                    licensingProcess.activate();
                                }
                            });
                        } else {
                            $mdToast.showSimple('Debes llenar todos los campos.');
                            licensingProcess.activate();
                        }
                    }, function() {});
                },
                bill: function() {
                    api.bill.create({
                        bill: {
                            customer: $scope.customer.id
                        },
                        success: function(data) {
                            $timeout(function() {
                                licensingProcess.done++;
                                // $mdToast.showSimple('Paso '+licensingProcess.done+' de '+licensingProcess.steps+': Se ha generado la factura.');
                            }, 1500);
                            licensingProcess.license(false, data);
                        },
                        error: function() {
                            $mdToast.showSimple('Hubo un error al procesar tu solicitud, inténtalo de nuevo más tarde.');
                            api.customer.update({
                                id: $scope.customer.id,
                                customer: {
                                    status: 1
                                },
                                success: function(data) {
                                    $scope.customer.status = 1;
                                },
                                error: function(error) {
                                    $scope.customer.status = 1;
                                }
                            });
                        }
                    })
                },
                license: function(renewal, bill) {
                    var process = function() {
                        licensingCount = 0;
                        licensingError = 0;
                        for (i = 0; i < $scope.products.length; i++) {
                            if ($scope.products[i].id != 10) { // Descartar descuento
                                if ($scope.products[i].licenses < 0) {
                                    $scope.products[i].licenses = 0;
                                }
                                var newLicense = {
                                    customer: $scope.customer.id,
                                    product: $scope.products[i].id,
                                    quantity: $scope.products[i].licenses
                                };
                                if (bill) {
                                    newLicense.bill = bill.id;
                                }
                                api.license.create({
                                    license: newLicense,
                                    success: function(data) {
                                        licensingCount++; //For async purposes
                                    },
                                    error: function(error) {
                                        licensingError++; //For async purposes
                                        console.log(error);
                                    }
                                })
                            }
                        }
                        var wait = $interval(function() { //For async purposes
                            if (($scope.products.length - 1) == licensingCount) {
                                //PROCESS DONE
                                $timeout(function() {
                                    $mdToast.showSimple('El proceso se ha completado exitosamente');
                                }, 500);
                                $interval.cancel(wait);
                            }
                        }, 500);
                        var fail = $interval(function() { //For async purposes
                            if (licensingError > 0) {
                                //PROCESS DONE
                                $timeout(function() {
                                    $mdToast.showSimple('Ocurrió un error durante el proceso, intentalo de nuevo más tarde.');
                                }, 500);
                                $interval.cancel(fail);
                                $interval.cancel(wait);
                            }
                        }, 500);
                        $timeout(function() {
                            licensingProcess.done++;
                            // $mdToast.showSimple('Paso '+licensingProcess.done+' de '+licensingProcess.steps+': Se han habilitado los productos y licencias.');
                        }, 3000);
                    }
                    if (renewal) {
                        var confirmRenewal = $mdDialog.confirm()
                            .title('Actualización de licencias')
                            .content('<div layout="row" layout-wrap><p flex="100">¿Estás seguro que deseas guardar los cambios?</p></div>')
                            .ok('Continuar')
                            .cancel('Regresar');
                        $mdDialog.show(confirmRenewal).then(function() {
                            process();
                        }, function() {});
                    } else {
                        process();
                    }
                },
                run: function() {
                    if ($scope.customer.status == 1) {
                        //Run whole process
                        licensingProcess.steps = 3;
                        licensingProcess.activate();
                    } else {
                        licensingProcess.steps = 1;
                        licensingProcess.license(true);
                    }
                    var wait = $interval(function() {
                        if (licensingProcess.done == licensingProcess.steps) {
                            //PROCESS DONE
                            $timeout(function() {
                                $mdToast.showSimple('El proceso se ha completado exitosamente');
                            }, 500);
                            $interval.cancel(wait);
                        }
                    }, 500);
                    // Check if app specifics have been created, if not, create.
                    var productCheck = function(product, customer) {
                            api.customer.productCompany.getOne({
                                customer: customer,
                                product: product,
                                success: function(data) {
                                    if (data.length == 0) {
                                        // Still doesnt exist, create
                                        if (product == 1) {

                                            api.customer.core.company({
                                                customer: $scope.customer,
                                                success: function(data) {
                                                    api.customer.productCompany.create({
                                                        productCompany: {
                                                            customer: customer,
                                                            product: product,
                                                            company: data.id
                                                        },
                                                        success: function(data) {
                                                            console.log(data);
                                                        },
                                                        error: function(error) {
                                                            console.log(error)
                                                        }
                                                    })
                                                },
                                                error: function(error) {
                                                    console.log(error);
                                                }
                                            })
                                        } else if (product == 2) {
                                            api.customer.device.company({
                                                customer: $scope.customer,
                                                success: function(data) {
                                                    api.customer.productCompany.create({
                                                        productCompany: {
                                                            customer: customer,
                                                            product: product,
                                                            company: data.id
                                                        },
                                                        success: function(data) {
                                                            console.log(data);
                                                            $timeout(function() {
                                                                api.customer.device.users.getAll({
                                                                    id: $scope.deviceCompany.company,
                                                                    params: 'idUsuario id&nombre fname&apellido lname&email&telefono phone&password',
                                                                    success: function(data) {
                                                                        console.log(data);
                                                                        $scope.usersDevice = data;
                                                                        for(i in data){
                                                                            try {
                                                                                var user = data[i];
                                                                                formattedPhone = JSON.parse(user.phone);
                                                                                if(user.phone[0]){
                                                                                    
                                                                                    formattedPhone = [{ code : JSON.parse(user.phone)[0].code, number : JSON.parse(user.phone)[0].number  }]
                                                                                }

                                                                            } catch(err) {

                                                                                formattedPhone = [{ code : '', number : '' }];
                                                                            }
                                                                            user.phone = JSON.stringify(formattedPhone);
                                                                        }
                                                                    },
                                                                    error: function(error) {
                                                                        console.log(error);
                                                                    }
                                                                })
                                                            }, 1000)
                                                        },
                                                        error: function(error) {
                                                            console.log(error)
                                                        }
                                                    })
                                                },
                                                error: function(error) {
                                                    console.log(error);
                                                }
                                            });
                                        }
                                    }
                                },
                                error: function(error) {
                                    console.log(error);
                                }
                            })
                        }
                        // Select products to test and/or create
                    for (product in $scope.products) {
                        if ($scope.products[product].licenses > 0 && ($scope.products[product].id == 1 || $scope.products[product].id == 2)) {
                            productCheck($scope.products[product].id, $scope.customer.id);
                        }
                    }
                }
            }
            //VALIDACIÓN DE CANTIDAD DE LICENCIAS
        var activeLicenses = { core : { overdue : false, quantity : 0 }, device : { overdue : false, quantity : 0 }, crm : { overdue : false, quantity : 0 }, helpdesk : { overdue : false, quantity : 0 }, learning : { overdue : false, quantity : 0 }, project : { overdue : false, quantity : 0 } };
        for (user in $scope.users) {
            // products[0 2 3 4 5]
            if($scope.users[user].core){
                activeLicenses.core.quantity ++;
            }
            if($scope.users[user].crm){
                activeLicenses.crm.quantity ++;
            }
            if($scope.users[user].helpdesk){
                activeLicenses.helpdesk.quantity ++;
            }
            if($scope.users[user].learning){
                activeLicenses.learning.quantity ++;
            }
            if($scope.users[user].project){
                activeLicenses.project.quantity ++;
            }
        }
        
        if(activeLicenses.core.quantity > $scope.products[0].licenses){
            activeLicenses.core.overdue = true;
            // alert(activeLicenses.core.overdue);
        }
        if(activeLicenses.crm.quantity > $scope.products[2].licenses){
            activeLicenses.crm.overdue = true;
            // alert(activeLicenses.crm.overdue);
        }
        if(activeLicenses.helpdesk.quantity > $scope.products[3].licenses){
            activeLicenses.helpdesk.overdue = true;
        }
        if(activeLicenses.learning.quantity > $scope.products[4].licenses){
            activeLicenses.learning.overdue = true;
        }
        if(activeLicenses.project.quantity > $scope.products[5].licenses){
            activeLicenses.project.overdue = true;
        }
        

        if(activeLicenses.core.overdue || activeLicenses.crm.overdue || activeLicenses.helpdesk.overdue || activeLicenses.learning.overdue){
            $mdToast.showSimple('Las licencias ocupadas exceden el nuevo valor. Los cambios no serán guardados.');
        }else{
            licensingProcess.run();
        }
        },
        users: {

        },
        delete: function() {
            var confirm = $mdDialog.confirm()
                .title('Eliminar cliente.')
                .content('Al confirmar esta acción eliminas por completo a esta compañía, sus usuarios y todos sus datos de manera irreversible, ¿Estás seguro que quieres continuar?')
                .ok('Eliminar cliente')
                .cancel('Regresar');

            $mdDialog.show(confirm).then(function() {
                api.customer.delete({
                    id: $scope.customer.id,
                    success: function(data) {
                        $state.go('main.customers');
                        $timeout(function() {
                            $mdToast.showSimple('¡El cliente ha sido eliminado con éxito!');
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
        execute: $scope.customerActions.form.edit,
        title: 'Editar'
    }, {
        icon: 'ion-ios-trash',
        execute: $scope.customerActions.delete,
        title: 'Eliminar'
    }, {
        icon: 'ion-close-circled',
        execute: $scope.customerActions.disable,
        title: 'Inhabilitar'
    }];

    $scope.actionsUser = [{
            icon: 'ion-edit',
            execute: $scope.editUser.form.edit,
            title: 'Editar'
        }
        //    , {
        //        icon: 'ion-ios-trash',
        //        execute: $scope.newUser.delete,
        //        title: 'Eliminar'
        //    }
        //    , {
        //        icon: 'ion-close-circled',
        //        execute: $scope.newUser.disable,
        //        title: 'Inhabilitar'
        //    }
    ];

    $scope.actionsUserDevice = [
        {
            icon: 'ion-edit',
            execute: $scope.editUserDevice.form.edit,
            title: 'Editar'
        }, 
        {
            icon: 'ion-ios-trash',
            execute: $scope.newUserDevice.delete,
            title: 'Eliminar'   
        }
        //    , {
        //        icon: 'ion-close-circled',
        //        execute: $scope.newUserDevice.disable,
        //        title: 'Inhabilitar'
        //    }
    ];
    //check if access
    $timeout(function() {
        if (!$rootScope.profile.customers.module) {
            var none = true;
            if ($rootScope.profile.customers.module) {
                // $state.go('main.customers');
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