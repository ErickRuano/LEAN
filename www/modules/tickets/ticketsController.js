app.controller('ticketsController', function($scope, $rootScope, $state, $timeout, $http, api, localStorage, $mdToast, dialog, $mdDialog,helpdesk) {
    //Variables & defaults
    $scope.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    $scope.filterInitial = "";



    $scope.tableHeaders = [{
        title:'ID'
    },{
        title:'CATEGORÍA'
    },{
        title:'ASUNTO'
    },{
        title:'FECHA DE CREACIÓN'
    },{
        title:'ESTADO'
    }];


    //Methods definition

    $scope.filterLetter = function(letter){
        if(letter == $scope.filterInitial){
            $scope.filterInitial = "";
        }else{
            $scope.filterInitial = letter;
        }
    };

    $scope.goTicket = function(ticket){

        helpdesk.get('/api/helpdesk/ticketDetailExternal', {idTicket : ticket.id}).success(function(data){
            console.info(data);

            $rootScope.inTicket = ticket;
            $rootScope.ticketDetail = data;
            $state.go('main.ticket', { id : ticket.id} );

        });
    }

    // Fetch data

    api.agent.getAll({
        success : function(data){
            console.log(data);
            $scope.agents = data;       
        },
        error : function(error){
            console.log(error);
        }
    })

    // Actions

    $scope.newTicket = {
        form : {
            fields : {
                subject : '',
                category : '',
                comment : ''
            },
            create  : function(){
                helpdesk.get('/api/helpdesk/validateSupportExternal', {
                       idUser:$rootScope.user.id, 
                       redmadre: 10, 
                       fname:'TELCO',
                       lname:'Support', 
                       username:$rootScope.user.username
                }).success(function(data){
                       
                });

                dialog.create({
                  "title" : "Nuevo ticket",
                  "body": "<div layout='row' layout-wrap>"+
                    '<md-input-container flex="100">'+
                        '<label>Asunto</label>'+
                        '<input ng-model="newTicket.form.fields.subject">'+
                    '</md-input-container>'+
                    '<md-input-container flex="100">'+
                        '<md-select ng-model="newTicket.form.fields.category" placeholder="Selecciona una categoría">'+
                            '<md-option ng-value="{{category.tc_tickets_category}}" ng-repeat="category in categories">{{category.tc_name}}</md-option>'+
                        '</md-select>'+
                    '</md-input-container>'+ 
                    '<md-input-container flex>'+
                        '<label>Comentario</label>'+
                        '<textarea ng-model="newTicket.form.fields.comment" columns="1" md-maxlength="500"></textarea>'+
                    '</md-input-container>'+
                  "</div>",
                  "data": "",
                  "buttons": [
                    {
                      "text": "Crear",
                      "action" : "newTicket.create"
                    },
                    {
                      "text": "Cancelar"
                    }
                  ]
                })
            },
            validate : function(){
                
                
                var error = {
                    count : 0,
                    message : "<p>Debe llenar los siguientes campos:</p><p>",
                    check : false
                }

                var form = $scope.newTicket.form.fields;
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                if(form.subject == ''){
                    error.count ++;
                    error.message = error.message + 'Asunto, ';
                }
                if(form.category == ''){
                    error.count ++;
                    error.message = error.message + 'Categoría, ';
                }
                if(form.comment == ''){
                    error.count ++;
                    error.message = error.message + 'Comentario, ';
                }
                // Trim string
                error.message = error.message.substring(0, error.message.length-2) + ' .</p> '

                if(error.count > 0){
                    error.check = false;
                }else{
                    error.check = true;
                }

                return error;
            }
        },
        create : function(){
            var error = $scope.newTicket.form.validate();
            if(error.check){
                helpdesk.get('/api/helpdesk/addTicketExternal', {   iduser : $rootScope.user.id,
                                                                    idNetwork : 53,
                                                                    asunto : $scope.newTicket.form.fields.subject,
                                                                    comment : $scope.newTicket.form.fields.comment,
                                                                    category : $scope.newTicket.form.fields.category,
                                                                    priority : 3
                                        
                }).success(function(data){
                    $scope.getTickets();
                    $timeout(function(){
                        dialog.destroy();
                        $timeout(function(){
                            $mdToast.showSimple('Ticket creado correctamente!');
                            
                        }, 1000)
                    },1000)
                });

            }else{
                var confirm = $mdDialog.confirm()
                      .title('Formulario incompleto.')
                      .content(error.message)
                      .ok('Completar formulario')
                $mdDialog.show(confirm).then(function(){});
            }
        }
    }
    
    //--CATEGORIAS

    //--obtener categorias


    helpdesk.get('/api/helpdesk/getCategory', {redmadre : 53}).success(function(data){
        $scope.categories = [];
        console.log(data);
        // var idscat= [1,2,3,4,5,16,96,102,105,106,107];
        var idscat= [1,3,5,16,96,102,105,106,107];
        for (var i = 0; i < data.length; i++) {
            var a = idscat.indexOf(parseInt(data[i].tc_tickets_category));
            // console.info(data[i]);
            if(a > -1){
                $scope.categories.push(data[i]);
            }
        }
        console.info('--------------------------');
        console.info($scope.categories);
    });


    //obtener tickets

    $scope.getTickets = function(){
        helpdesk.get('/api/helpdesk/getTicketExternal', {iduser : $rootScope.user.id,redmadre:53}).success(function(data){
                $scope.tickets = data;
                console.info($scope.tickets)
        });
    }
     $scope.getTickets();
});