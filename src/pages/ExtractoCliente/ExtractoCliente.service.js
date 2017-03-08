var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Configuracion } from '../../components/configuracion/configuracion';
var ExtractoClienteService = (function () {
    function ExtractoClienteService(http) {
        this._baseUrl = Configuracion.API_URL + '/ExtractosCliente';
        this.http = http;
    }
    ExtractoClienteService.prototype.cargarDeuda = function (cliente) {
        var params = new URLSearchParams();
        params.set('cliente', cliente.cliente);
        return this.http.get(this._baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ExtractoClienteService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    return ExtractoClienteService;
}());
ExtractoClienteService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Http])
], ExtractoClienteService);
export { ExtractoClienteService };
//# sourceMappingURL=ExtractoCliente.service.js.map