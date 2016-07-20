app.controller('paymentController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, dialog) {

    
    // Vars & Defaults
    
    $scope.date = new Date();
    $scope.today = $scope.date.getTime();
    $scope.paymentTab = 1;

    if($state.current.name == 'main.customer'){
        var entity = 'customer';
        var source = $state.params.id;
    }else if($state.current.name == 'main.partner'){
        var entity = 'partner';
        var source = $state.params.id;
    }else {

    }

    $scope.methods = [
        {
            id: 1,
            name: 'Tarjeta de crédito',
            icon: 'ion-card'
        }, 
        {
            id: 2,
            name: 'Efectivo',
            icon: 'ion-cash'
        }, 
        {
            id: 3,
            name: 'Depósito',
            icon: 'ion-card'
        }, 
        {
            id: 4,
            name: 'Cheque',
            icon: 'ion-cash'
        }
    ];

    $scope.icons = [{
            id: 1,
            icon:'ion-cloud'
        },{
            id: 2,
            icon:'ion-android-bookmark'
        },{
            id: 3,
            icon:'ion-ios-chatbubble'
        },{
            id: 4,
            icon:'ion-star'
        },{
            id: 5,
            icon:'ion-ios-locked'
        },{
            id: 6,
            icon:'ion-ios-people'
        },{
            id: 7,
            icon:'ion-wrench'
        },{
            id: 8,
            icon:'ion-reply'
        },{
            id: 9,
            icon:'ion-ios-color-wand'
        },{
            id: 10,
            icon:'ion-earth'
        },{
            id: 11,
            icon:'ion-android-phone-portrait'
        },{
            id: 12,
            icon:'ion-android-alarm-clock'
        },{
            id: 13,
            icon:'ion-ios-gear'
        },{
            id: 14,
            icon:'ion-flash'
        },{
            id: 15,
            icon:'ion-ios-calculator'
        },{
            id: 16,
            icon:'ion-android-list'
        },{
            id: 17,
            icon:'ion-heart'
        },{
            id: 18,
            icon:'ion-alert'
        }]

        api.category.getAll({
            id : $rootScope.user.partner,
            success : function(data){
                console.log('hey');
                console.log('////////////////////////////////');
                console.log(data);
                console.log('////////////////////////////////');
                $scope.categories = data;
            },
            error : function(error){
                console.log(error);
            }
        })

    // Methods
    $scope.paymentChangeTab = function(tab) {
        if ($scope.paymentTab != tab) {
            $scope.paymentTab = tab;
        }
    }

    $scope.getIcon = function(icon){
        for(i in $scope.icons){
            if($scope.icons[i].id == icon){
                return $scope.icons[i].icon;
            }
        }
    }
    $scope.getCategoryHTML = function(category){
        var name = "";
        var icon = "";
        for(i in $scope.categories){
            if($scope.categories[i].id == category){
                name = $scope.categories[i].name;
                icon = $scope.getIcon($scope.categories[i].icon);
                return '<i class="'+icon+'" style="font-size:18px;"></i><br><span>'+name+'</span>';
            }
        }
        return icon;
    }

    $scope.getMethod = function(method){
        for(i in $scope.methods){
            if($scope.methods[i].id == method){
                return $scope.methods[i].name;
            }
        }
    }
    


    $scope.newPayment = {
        form : {
            fields : {
                description : "",
                category : 1,
                amount : 0,
                method : 1,
                source : source
            },
            value : '+',
            validate : function(){
                var error = {
                    count: 0,
                    message: '',
                    check: true
                }
                if($scope.newPayment.form.fields.description == ''){
                    error.count ++;
                    error.message = error.message + 'Debes llenar el campo Nombre de registro monetario.'
                }
                if($scope.newPayment.form.fields.amount == 0){
                    error.count ++;
                    error.message = error.message + 'Debes llenar el campo Monto.'
                }
                if(error.count > 0){
                    error.check = false;
                }else{
                    error.check = true;
                }
                return error;      
            }
        },
        setMethod : function(method) {
            $scope.newPayment.form.fields.method = method.id;
        },
        setCategory : function(category) {
            $scope.newPayment.form.fields.category = category.id;
            $scope.newPayment.form.value = category.value;
        },
        create : function(){
            var form = $scope.newPayment.form.validate();
            if (form.check) {
                api.payment.create[entity]({
                    payment : $scope.newPayment.form.fields,
                    success : function(data){
                        console.log(data);
                        $scope.payments.push(data);
                        dialog.destroy();
                        $scope.paymentChangeTab(1)
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
            } else {
                alert(form.message)
            }
        }
    }

    //Fetch Data

    // $scope.categories = [
    //     {
    //         name : 'Pago',
    //         id : 1,
    //         icon : 1,
    //         value : '+'
    //     },
    //     {
    //         name : 'Descuento',
    //         id : 2,
    //         icon : 2,
    //         value : '-'
    //     },
    //     {
    //         name : 'Abono',
    //         id : 3,
    //         icon : 3,
    //         value : '+'
    //     }
    // ]

    


    $scope.newCategory = {
        form: {
            fields: {
                name: "",
                icon: 1,
                value: "+"
            },
            create: function() {
                dialog.create({
                    title: 'NUEVA CATEGORÍA',
                    body: '<div layout="column" id="newCategoryContainer">' 
                            + '<span>Selecciona valor de esta categoría</span>' 
                            + '<div style="margin-top:20px;" layout="row" class="amountContainer">' 
                                + '<div class="amount pointer" ng-click="newCategory.selectValue(\'+\')" ng-class="{selectedMore:newCategory.form.fields.value == \'+\'}" style="border: 1px solid #8cc63e;color:#b5d333;background:white" flex="10"><i class="ion-plus"></i></div>' 
                                + '<div class="amount pointer" ng-click="newCategory.selectValue(\'-\')" ng-class="{selectedLess:newCategory.form.fields.value == \'-\'}" style="border: 1px solid #ed1c24;color:#ed1c24;background:white;margin-left:10px;" flex="10"><i class="ion-minus"></i></div>' 
                            + '</div>' 
                            + '<span style="margin-top:40px;">Nombre de categoría</span>' 
                            + '<md-input-container flex>' 
                                + '<label>Nombre</label>' 
                                + '<input ng-model="newCategory.form.fields.name">' 
                            + '</md-input-container>' 
                            + '<span style="margin-top:30px;">Selecciona un icono para esta categoría</span>' 
                            + '<div style="margin-top:20px;" layout="row" layout-wrap class="iconContainer">' 
                                + '<i ng-repeat="icon in newCategory.icons" class="{{icon.icon}} md-icon-button categoryIcon" ng-class="{selected: newCategory.form.fields.icon == icon.id}" md-button ng-click="newCategory.selectIcon(icon)" flex="10"></i>' 
                            + '<div>' 
                        + '</div>',
                    data: '',
                    buttons: [{
                        text: 'Crear',
                        action: 'newCategory.create'
                    }, {
                        text: 'Cancelar'
                    }]
                })
            },
            validate: function() {
                var error = {
                    count: 0,
                    message: '',
                    check: true
                }
                if($scope.newCategory.form.fields.name == ''){
                    error.count ++;
                    error.message = error.message + 'Debes llenar el campo Nombre.'
                }
                if(error.count > 0){
                    error.check = false;
                }else{
                    error.check = true;
                }
                return error;    
            }
        },
        selectValue: function(value) {
            $scope.newCategory.form.fields.value = value;
        },
        selectIcon: function(icon) {
            $scope.newCategory.form.fields.icon = icon.id;
        },
        icons: $scope.icons,
        create: function() {
            var form = $scope.newCategory.form.validate();
            if (form.check) {
                api.category.create({
                    category : $scope.newCategory.form.fields,
                    success : function(data){
                        console.log(data);
                        $scope.categories.push(data);
                        dialog.destroy();
                    },
                    error : function(error){
                        console.log(error);
                    }
                })
            } else {
                alert(form.message)
            }
        }
    }
    
    $scope.paymentHeaders = [{
        title: 'Categoría'
    }, {
        title: 'Nombre del registro'
    }, {
        title: 'Método de pago'
    }, {
        title: 'Fecha de ingreso'
    }, {
        title: 'Monto'
    }];

    // Fetch Data

    // $scope.payments = [{
    //     category: 'Categoría',
    //     description: 'Nombre de registro',
    //     method: 'Método',
    //     created: new Date,
    //     amount: 1000,
    //     category: 2,
    //     method: 1
    // }, {
    //     category: 'Categoría',
    //     description: 'Nombre de registro',
    //     method: 'Método',
    //     created: new Date,
    //     amount: 1000,
    //     category: 3,
    //     method: 2
    // }, {
    //     category: 'Categoría',
    //     description: 'Nombre de registro',
    //     method: 'Método',
    //     created: new Date,
    //     amount: 1000,
    //     category: 1,
    //     method: 3
    // }, {
    //     category: 'Categoría',
    //     description: 'Nombre de registro',
    //     method: 'Método',
    //     created: new Date,
    //     amount: 1000,
    //     category: 1,
    //     method: 4
    // }];

    api.payment.getAll[entity]({
        id : source,
        success : function(data){
            $scope.payments = data;
        }
    });

});