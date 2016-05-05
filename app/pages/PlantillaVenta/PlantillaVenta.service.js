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
var Rx_1 = require('rxjs/Rx');
var configuracion_1 = require('../../componentes/configuracion/configuracion');
var PlantillaVentaService = (function () {
    function PlantillaVentaService(http) {
        this._baseUrl = configuracion_1.Configuracion.API_URL + '/PedidosVenta';
        this.http = http;
    }
    PlantillaVentaService.prototype.crearPedido = function (pedido) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this._baseUrl, JSON.stringify(pedido), { headers: headers })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    PlantillaVentaService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Rx_1.Observable.throw(error.json().error || 'Server error');
    };
    PlantillaVentaService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], PlantillaVentaService);
    return PlantillaVentaService;
}());
exports.PlantillaVentaService = PlantillaVentaService;
