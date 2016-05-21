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
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/operator/map');
var configuracion_1 = require('../../componentes/configuracion/configuracion');
var Usuario_1 = require('../../models/Usuario');
var SelectorClientesService = (function () {
    function SelectorClientesService(http, usuario) {
        this._clientesUrl = configuracion_1.Configuracion.API_URL + '/Clientes';
        this.http = http;
        this.usuario = usuario;
    }
    SelectorClientesService.prototype.getClientes = function (filtro) {
        var params = new http_1.URLSearchParams();
        params.set('empresa', configuracion_1.Configuracion.EMPRESA_POR_DEFECTO);
        params.set('filtro', filtro);
        if (this.usuario.vendedor) {
            params.set('vendedor', this.usuario.vendedor);
        }
        return this.http.get(this._clientesUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorClientesService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable_1.Observable.throw(error.json().error || 'Server error');
    };
    SelectorClientesService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http, Usuario_1.Usuario])
    ], SelectorClientesService);
    return SelectorClientesService;
}());
exports.SelectorClientesService = SelectorClientesService;
