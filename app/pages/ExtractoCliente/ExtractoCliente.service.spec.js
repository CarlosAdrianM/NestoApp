"use strict";
var ExtractoCliente_service_1 = require('./ExtractoCliente.service');
var core_1 = require('@angular/core');
var testing_1 = require('@angular/core/testing');
var testing_2 = require('@angular/http/testing');
var http_1 = require('@angular/http');
function main() {
    'use strict';
    testing_1.describe('Extracto Cliente', function () {
        testing_1.beforeEachProviders(function () {
            return [
                http_1.HTTP_PROVIDERS,
                core_1.provide(http_1.XHRBackend, { useClass: testing_2.MockBackend }),
                ExtractoCliente_service_1.ExtractoClienteService,
            ];
        });
        testing_1.it('should get blogs', testing_1.inject([http_1.XHRBackend, ExtractoCliente_service_1.ExtractoClienteService], function (mockBackend, servicio) {
            // first we register a mock response - when a connection 
            // comes in, we will respond by giving it an array of (one)
            // blog entries
            mockBackend.connections.subscribe(function (connection) {
                return [
                    connection.mockRespond(new http_1.Response(new http_1.ResponseOptions({
                        body: [{ id: 1762202 }],
                    }))),
                ];
            });
            // with our mock response configured, we now can 
            // ask the blog service to get our blog entries
            // and then test them
            var cliente = {
                'cliente': '15191',
                'nombre': 'Cliente de prueba',
            };
            servicio.cargarDeuda(cliente).subscribe(function (data) {
                testing_1.expect(data.length).toBe(1);
                testing_1.expect(data[0].id).toBe(1762202);
            });
        }));
    });
}
exports.main = main;
