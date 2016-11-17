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
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';
export var SelectorFormasPagoService = (function () {
    function SelectorFormasPagoService(http, usuario) {
        this._baseUrl = Configuracion.API_URL + '/FormasPago';
        this.http = http;
        this.usuario = usuario;
    }
    SelectorFormasPagoService.prototype.getFormasPago = function (cliente) {
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        if (cliente) {
            params.set('cliente', cliente);
        }
        return this.http.get(this._baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorFormasPagoService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    SelectorFormasPagoService = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [Http, Usuario])
    ], SelectorFormasPagoService);
    return SelectorFormasPagoService;
}());
//# sourceMappingURL=SelectorFormasPago.service.js.map