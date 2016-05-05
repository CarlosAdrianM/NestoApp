"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var http_1 = require('angular2/http');
var configuracion_1 = require('../../componentes/configuracion/configuracion');
var ListaPedidosVentaService = (function () {
    function ListaPedidosVentaService(http) {
        this._baseUrl = configuracion_1.Configuracion.API_URL + '/PedidosVenta';
        this.datosPrueba = [
            { "$id": "1", "empresa": "1  ", "numero": 36, "cliente": "1993      ", "contacto": "0  ", "nombreCliente": "JUAN SIN NOMBRE", "direccionCliente": "C/ ALEGRIA, 12", "fecha": "2002-08-27T00:00:00", "formaPago": "EFC", "plazosPago": "EFC", "primerVencimiento": "2011-06-30T00:00:00", "iva": "GN ", "vendedor": "JM ", "comentarios": "", "comentarioPicking": null, "periodoFacturacion": "NRM", "ruta": "REI", "serie": "NV ", "ccc": "3  ", "origen": "1  ", "contactoCobro": "0  ", "noComisiona": 0.0000, "vistoBuenoPlazosPago": false, "mantenerJunto": false, "servirJunto": false, "usuario": null, "baseImponible": 190.25 },
            { "$id": "2", "empresa": "1  ", "numero": 617511, "cliente": "26760     ", "contacto": "0  ", "nombreCliente": "PEPITO GARCIA LOPEZ", "direccionCliente": "AV. ALAMEDA, 18", "fecha": "2016-03-31T00:00:00", "formaPago": "EFC", "plazosPago": "EFC", "primerVencimiento": "2016-03-31T00:00:00", "iva": "G21", "vendedor": "ASH", "comentarios": "", "comentarioPicking": "", "periodoFacturacion": "NRM", "ruta": "REI", "serie": "NV ", "ccc": null, "origen": "1  ", "contactoCobro": "0  ", "noComisiona": 0.0000, "vistoBuenoPlazosPago": false, "mantenerJunto": false, "servirJunto": true, "usuario": null, "baseImponible": 19.95 },
            { "$id": "3", "empresa": "1  ", "numero": 620881, "cliente": "22530     ", "contacto": "0  ", "nombreCliente": "CARMEN DE MAIRENA", "direccionCliente": "C/ REINA, 5", "fecha": "2016-04-29T00:00:00", "formaPago": "EFC", "plazosPago": "EFC", "primerVencimiento": "2016-04-29T00:00:00", "iva": "G21", "vendedor": "ASH", "comentarios": "De 16 a 20h                                       ", "comentarioPicking": "", "periodoFacturacion": "NRM", "ruta": "FW ", "serie": "NV ", "ccc": null, "origen": "1  ", "contactoCobro": "0  ", "noComisiona": 0.0000, "vistoBuenoPlazosPago": false, "mantenerJunto": false, "servirJunto": false, "usuario": null, "baseImponible": 130 },
            { "$id": "4", "empresa": "1  ", "numero": 605919, "cliente": "15191     ", "contacto": "0  ", "nombreCliente": "CENTRO DE ESTETICA EL EDEN, S.L.U.", "direccionCliente": "C/ SEGOVIA, 1 - LOCAL", "fecha": "2015-11-30T00:00:00", "formaPago": "RCB", "plazosPago": "RCB", "primerVencimiento": "2016-03-25T00:00:00", "iva": "G21", "vendedor": "NV ", "comentarios": "\r\n                                                ", "comentarioPicking": "", "periodoFacturacion": "NRM", "ruta": "00 ", "serie": "NV ", "ccc": "4  ", "origen": "1  ", "contactoCobro": "0  ", "noComisiona": 0.0000, "vistoBuenoPlazosPago": false, "mantenerJunto": false, "servirJunto": false, "usuario": null, "baseImponible": 1902.25 }
        ];
        this.http = http;
    }
    ListaPedidosVentaService.prototype.cargarLista = function () {
        return this.datosPrueba;
    };
    ListaPedidosVentaService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ListaPedidosVentaService);
    return ListaPedidosVentaService;
}());
exports.ListaPedidosVentaService = ListaPedidosVentaService;
