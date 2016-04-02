import { ExtractoClienteService } from './ExtractoCliente.service';
import { provide } from 'angular2/core';
import {
    describe,
    expect,
    it,
    inject,
    beforeEachProviders,
} from 'angular2/testing';
import {MockBackend, MockConnection} from 'angular2/http/testing';
import {HTTP_PROVIDERS, XHRBackend, Response, ResponseOptions} from 'angular2/http';

export function main(): void {
    'use strict';

    describe('Extracto Cliente', () => {
        beforeEachProviders(() => {
            return [
                HTTP_PROVIDERS,
                provide(XHRBackend, { useClass: MockBackend }),
                ExtractoClienteService,
            ];
        });

        it('should get blogs', inject([XHRBackend, ExtractoClienteService], (mockBackend, servicio) => {
            // first we register a mock response - when a connection 
            // comes in, we will respond by giving it an array of (one)
            // blog entries
            mockBackend.connections.subscribe(
                (connection: MockConnection) => {
                    return [
                        connection.mockRespond(new Response(
                            new ResponseOptions({
                                body: [{ id: 1762202 }],
                            })
                        )),
                    ];
                }
            );
            // with our mock response configured, we now can 
            // ask the blog service to get our blog entries
            // and then test them
            let cliente: Object = {
                'cliente' : '15191',
                'nombre' : 'Cliente de prueba',
            };
            servicio.cargarDeuda(cliente).subscribe(
                data => {
                    expect(data.length).toBe(1);
                    expect(data[0].id).toBe(1762202);
                }
            );
        }));
    });
}
