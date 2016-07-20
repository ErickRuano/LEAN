var db = require('../../config/mysql.js')();
var httpStatus = require('../../config/httpStatusCodes')();
var md5 = require('./md5');
var request = require('request');
var encode = require('md5');

var customer = {

    getFromPartner: function(req, res) {

        var input = req.query;
        var user = req.params.partner;

        // SELECT stmt for query
        var select = '';

        for (key in input) {
            select = select + key + ', ';
        }

        if (select == '') {
            // If no parameters
            select = '*';
        } else {
            // Clean last comma
            select = select.substring(0, select.length - 2);
        }

        // dynamic fields query
        var query = "SET @query = CONCAT('SELECT ',?,' FROM customers WHERE status != 4 AND partner = ',?); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
        var params = [select, user];

        db.execute(query, params, function(data) {
            console.log(data);
            if (data[2]) {
                console.log(data[2]);
                res.send(data[2]);
            } else {
                res.send(httpStatus._400);
            }
        });

    },

    getAll: function(req, res) {

        var input = req.query;

        // SELECT stmt for query
        var select = '';

        for (key in input) {
            select = select + key + ', ';
        }

        if (select == '') {
            // If no parameters
            select = '*';
        } else {
            // Clean last comma
            select = select.substring(0, select.length - 2);
        }

        // dynamic fields query
        var query = "SET @query = CONCAT('SELECT ',?,' FROM customers'); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
        var params = [select];

        db.execute(query, params, function(data) {
            if (data[2]) {
                if (typeof req == 'function') {
                    req(data[2]);
                } else {
                    res.send(data[2]);
                }
            } else {
                if (typeof req == 'function') {
                    req(data[2]);
                } else {
                    res.send(httpStatus._400);
                }
            }
        });

    },

    getOne: function(req, res) {

        var input = req.query;
        var partner = req.session.user;
        var id = req.params.id;

        // SELECT stmt for query
        var select = '';

        for (key in input) {
            select = select + key + ', ';
        }

        if (select == '') {
            // If no parameters
            select = '*';
        } else {
            // Clean last comma
            select = select.substring(0, select.length - 2);
        }

        var query = "SET @query = CONCAT('SELECT ',?,' FROM customers WHERE id = ',?); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
        var params = [select, id];

        db.execute(query, params, function(data) {

            if (data[2] && data[2][0]) {
                var customer = data[2][0];
                if (true) {
                    res.send(customer);
                } else {
                    res.send(httpStatus._403);
                }
            } else {
                res.send(httpStatus._400);
            }

        });

    },

    create: function(req, res) {

        var input = req.body;

        //defaults
        input.status = 1; // customers must start as new
        input.deadline = 0; //  Deadline will be activation time, when it gets to status 2
        input.term = 0; //  Term is the amount of months of service, 0 for undefined
        input.cycle = 0; //  a Cycle is a month passed relative to a term
        input.created = req.clientTime; // 
        input.updated = req.clientTime; // On creation updated equals created
        input.partner = req.session.user; // Creator

        console.log('input');
        console.log(input);

        var query = "INSERT INTO customers (name, email, password, phone, country, city, address, zip, profile, language, deadline, term, cycle, partner, status, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        var params = [input.name, input.email, input.password, input.phone, input.country, input.city, input.address, input.zip, input.profile, input.language, input.deadline, input.term, input.cycle, input.partner, input.status, input.created, input.updated];

        console.log('params');
        console.log(params);

        db.execute(query, params, function(data) {
            console.log('error de crear customer');
            console.log(data);
            if (data.errno) {
                // On any error
                if (data.errno == 1062) {
                    // If error is duplicate entry
                    res.send(httpStatus._600)
                } else {
                    // On any other error
                    res.send(httpStatus._400)
                }
            } else {
                // On successful insert
                input.id = data.insertId;
                res.send(input);
            }
        });

    },

    update: function(req, res) {
        var input = req.body;

        // SET stmt for query
        var set = '';

        for (key in input) {
            set = set + key + ' = "' + input[key] + '", ';
        }

        console.log('set');
        console.log(set);


        // dynamic fields query
        var query = "SET @query = CONCAT('UPDATE customers SET ',?,' updated = ',?,' WHERE id = ',?); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
        var params = [set, req.clientTime, req.params.id];

        db.execute(query, params, function(data) {
            console.log(data);
            if (data.errno) {
                // On any error
                if (data.errno == 1062) {
                    // If error is duplicate entry
                    res.send(httpStatus._600)
                } else {
                    // On any other error
                    res.send(httpStatus._400)
                }
            } else {
                // On successful update
                res.send(httpStatus._200);
            }
        });
    },

    delete: function(req, res) {

        var input = req.body;

        var query = "UPDATE customers SET status = 4 WHERE id = ?";
        var params = [req.params.id];

        db.execute(query, params, function(data) {
            res.send(data);
        });

    },

    productCompany: {
        create: function(req, res) {
            var input = req.body;
            var query = "INSERT INTO customer_product_company (customer, product, company) values (?, ?, ?)"
            var params = [input.customer, input.product, input.company];

            db.execute(query, params, function(data) {
            console.log('akdfjdsaklfjdsalkfjdslkjf')
                console.log(data);
            console.log('akdfjdsaklfjdsalkfjdslkjf')
                res.send(data);
            })
        },
        getOne: function(req, res) {
            var input = req.body;

            console.log(',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,');
            console.log(',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,');

            input.customer = req.params.customer;
            input.product = req.params.product;

            console.log(input);
            var query = "SELECT * FROM customer_product_company WHERE customer = ? and product = ?";
            var params = [input.customer, input.product];

            db.execute(query, params, function(data) {
                console.log(data);
                if (data.length == 0) {
                    res.send([]);
                } else {
                    res.send(data[0]);
                }
            })
        }
    },
    core : {
        users : {
            getAll : function(req, res){
                // SELECT DISTINCT NUS.iduser, US.firstname fname, US.lastname lname, US.username email, US.phones phone FROM core_produccion_experimental.network_user NUS  JOIN core_produccion_experimental.user US ON US.iduser = NUS.iduser where idnetwork in (SELECT idnetwork FROM core_produccion_experimental.network where idcompany = 203 ORDER BY idnetwork);
                company = req.params.company;

                var query = "SELECT DISTINCT if(US.password != '' OR US.password != NULL, BOP.val, 404) pass, if(US.password != '' OR US.password != NULL, US.password, 404) password, NUS.iduser id, US.firstname fname, US.lastname lname, US.username email, US.phones phone FROM core_produccion_experimental.network_user NUS  JOIN core_produccion_experimental.user US ON US.iduser = NUS.iduser LEFT JOIN backoffice.passwords BOP ON BOP.md5 = US.password WHERE idnetwork in (SELECT idnetwork FROM core_produccion_experimental.network where idcompany = ? ORDER BY idnetwork) ORDER BY id;";
                var params = [company];

                db.execute(query, params, function(data) {
                console.log(query);
                console.log(company);
                console.log('GETALL USERS CORE');
                    console.log(data);
                    res.send(data);
                })
            },
            create : function(req, res){
                user = req.body;
                console.log(user);
                // user.phones = "['"+user.phones+"']";
                user.phones = user.phones;

                md5.encode(req, res, { service : false, val : user.password, callback : function(data){ console.log(data) } });

                var query = "SELECT * FROM core_produccion_experimental.user WHERE username = ?";
                var params = [user.username];

                db.execute(query, params, function(data) {

                    if(data.length > 0){
                        res.send(httpStatus._600);
                    }else{
                        var query = "SELECT * FROM core_produccion_experimental.network WHERE idcompany = ? ORDER BY idnetwork asc";
                        var params = [user.company];

                        db.execute(query, params, function(data) {
                            console.log('/////////////////////GET PRIMARY NETWORK');
                            console.log(data[1]);
                            user.idnetwork = data[1].idnetwork
                            console.log(user.phones)
                            user.password = encode(user.password)
                            request.post( 'http://52.2.52.209:14415/api/V1/user/', { json : user }, function(error, response, body) {
                                console.log('data RES body--------------')
                                console.log('body--------------')
                                console.log(body);
                                console.log('----------------------------')
                                console.log(body.value.id);
                                res.send(body);
                            });
                        })
                    }
                })

            },
            update : function(req, res){
                console.log('update core user');
                var user = req.params.user;
                var input = req.body;
                md5.encode(req, res, { service : false, val : input.password, callback : function(data){ console.log(data) } });

                var query = 'UPDATE core_produccion_experimental.user SET username = ?, firstname = ?, lastname = ?, password = md5(?), phones = ? WHERE iduser = ?';
                var params = [input.email, input.fname, input.lname, input.password, input.phone, user];



                db.execute(query, params, function(data){
                    console.log(data);
                    res.send(httpStatus._200);
                })
            },
            getAdmin : function(req, res){
                var input = req.query;

                // SELECT stmt for query
                var select = '';

                for (key in input) {
                    select = select + key + ', ';
                }

                if (select == '') {
                    // If no parameters
                    select = '*';
                } else {
                    // Clean last comma
                    select = select.substring(0, select.length - 2);
                }

                // dynamic fields query
                var query = "SET @query = CONCAT('SELECT ',?,' FROM core_produccion_experimental.users US WHERE US.username IN (select backoffice.customers.email from backoffice.customers) AND company = ',?,' limit 1'); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
                var params = [select, req.params.company];

                db.execute(query, params, function(data) {
                    if(data.length > 0){
                        res.send(data[2][0]);
                    }else{
                        res.send(httpStatus._404);
                    }
                });
            },
            getLicenses : function(req, res){
                var input = req.params.company;

                var query = "SELECT CPU.iduser id, BUP.product FROM core_produccion_experimental.user CPU JOIN core_produccion_experimental.network_user CPNU ON CPU.iduser = CPNU.iduser JOIN backoffice.user_product BUP ON BUP.user = CPU.iduser WHERE CPNU.idnetwork IN (SELECT CN.idnetwork FROM backoffice.customer_product_company CPC JOIN core_produccion_experimental.network CN ON CPC.company = CN.idcompany WHERE CPC.company = ? order by CN.idnetwork asc)"
                var params = [input];
                    console.log('-------------------------------------------------------------')
                    console.log('-------------------------------------------------------------')
                    console.log('-------------------------------------------------------------')
                    console.log(input);
                    console.log('-------------------------------------------------------------')
                    console.log('-------------------------------------------------------------')
                    console.log('-------------------------------------------------------------')

                db.execute(query, params, function(data){
                    console.log('-------------------------------------------------------------')
                    console.log(data);
                    res.send(data);
                })
            }
        },
        company : function(req, res) {
            var input = req.body;
            md5.encode(req, res, { service : false, val : input.password, callback : function(data){ console.log(data) } });
            request.post(
                'http://54.243.132.87:3001/company/create', {
                    json: {
                        "name": input.name,
                        "icon": "/img/pentclouddefaultimageforcore.png",
                        "username": input.email,
                        "password" : encode(input.password)
                    }
                },
                function(error, response, body) {

                    if (!error && response.statusCode == 200) {
                        console.log(body);
                        var parse = body.value.id.split(',');
                        var data = {
                                mother: parse[0],
                                network: parse[1],
                                admin: parse[2]
                            }
                            // res.send(body)
                        var query = "SELECT company.idcompany id FROM core_produccion_experimental.company company WHERE username like '%"+input.email+"%';";
                        var params = [input.email];
                        console.log(input.email);

                        db.execute(query, params, function(data2) {
                            console.log(data2);
                            data.id = data2[0].id;
                            res.send(data);
                        });
                    }
                }
            );
        }
    },
    device : {
        company : function(req, res){
            console.log('CREACION COMPANY DEVICE -------------------------------');
            console.log('--------------------------------------------------------------');

            var input = req.body;
            console.log(input);

            var query = "INSERT INTO device_produccion.empresa (nombre, email) values (?, ?)"
            var params = [input.name, input.email];

            db.execute(query, params, function(data) {
                console.log('///////////////////device creado');
                console.log(data.insertId);
                res.send({ id : data.insertId });
            })

        },
        users : {
            getAll : function(req, res){
                var input = req.query;
                var company = req.params.company;

                // SELECT stmt for query
                var select = '';

                for (key in input) {
                    select = select + 'DPU.' + key + ', ';
                }

                if (select == '') {
                    // If no parameters
                    select = 'DPU.*';
                } else {
                    // Clean last comma
                    select = select.substring(0, select.length - 2);
                }

                // dynamic fields query
                var query = "SET @query = CONCAT('SELECT ',?,', if(DPU.password != NULL OR DPU.password != \"\", BOP.val, 404) pass FROM device_produccion.usuario DPU LEFT JOIN backoffice.passwords BOP ON BOP.md5 = DPU.password WHERE idEmpresa = ',?); PREPARE q FROM @query; EXECUTE q; DEALLOCATE PREPARE q;";
                var params = [select, company];

                db.execute(query, params, function(data) {
                    console.log('aqui ya viene desencriptado device');
                    console.log(data[2]);
                    var count = 0;
                    res.send(data[2]);
                })                
            },
            create : function(req, res){
                var input = req.body;

                var query = "SELECT US.*, (select SUS.idUsuario from device_produccion.empresa SEM JOIN device_produccion.usuario SUS ON SEM.email = SUS.email where SEM.idEmpresa = ?) admin FROM device_produccion.usuario US WHERE US.email = ?; SELECT idUsuario admin FROM device_produccion.usuario US JOIN device_produccion.empresa EM ON US.email = EM.email WHERE EM.idEmpresa = ?";
                var params = [input.company, input.email, input.company];
                console.log(query);
                console.log(params);

                md5.encode(req, res, { service : false, val : input.password, callback : function(data){ } });

                db.execute(query, params, function(user) {

                    console.log('device new user ///////////////////////////////')
                    console.log(user);
                    console.log('device new user ///////////////////////////////')
                    console.log(input);
                    if(user[0].length > 0){
                        res.send(httpStatus._600);
                    }else{
                        if(!req.clientTime){
                            input.created = new Date();
                        }else{
                            input.created = req.clientTime;
                        }

                        var query = "INSERT INTO device_produccion.usuario (nombre, apellido, password, idEmpresa, email, telefono, fechaCreacion, estado) values (?, ?, ?, ?, ?, ?, ?, ?)"
                        var params = [input.fname, input.lname, encode(input.password), input.company, input.email, input.phone, input.created, 1];

                        db.execute(query, params, function(newUser) {
                            console.log('device new user callback');
                            console.log(newUser);
                            input.id = newUser.insertId;
                            var query = "INSERT INTO device_produccion.usuariodet (usuarioPadre, usuarioHijo) values (?, ?)"
                            console.log(query);
                            console.log("*****************************")
                            console.log("Aqui viene el problema")
                            console.log(user)
                            var params = [user[1][0].admin, newUser.insertId]
                            console.log(params);

                            db.execute(query, params, function(end){
                                console.log('Users linked succesfully');
                                console.log(end);
                                res.send(input);
                            })
                        })
                    }
                });
            },
            update : function(req, res){
                console.log('update device user')
                var user = req.params.user;
                var input = req.body;
                md5.encode(req, res, { service : false, val : input.password, callback : function(data){ console.log(data) } });
                
                var query = 'UPDATE device_produccion.usuario SET email = ?, nombre = ?, apellido = ?, password = md5(?), telefono = ? WHERE idUsuario = ?';
                var params = [input.email, input.fname, input.lname, input.password, input.phone, user];

                console.log(params)


                db.execute(query, params, function(data){
                    console.log(data);
                    res.send(httpStatus._200);
                })
            },
            delete : function(req, res){
                var query = "DELETE FROM device_produccion.usuariodet WHERE usuarioPadre = ? OR usuarioHijo = ?; DELETE FROM device_produccion.usuario WHERE idUsuario = ?;";
                var params = [req.params.id, req.params.id, req.params.id];


                console.log('eliminar')
                db.execute(query, params, function(data) {
                    console.log(data)
                    res.send(httpStatus._200);
                })                  
            }
          }
    }
}

module.exports = customer;