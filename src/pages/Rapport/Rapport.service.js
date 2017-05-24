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
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';
var RapportService = (function () {
    function RapportService(http, usuario) {
        this.usuario = usuario;
        this._baseUrl = Configuracion.API_URL + '/SeguimientosClientes';
        this._clientesUrl = Configuracion.API_URL + '/Clientes';
        this.http = http;
    }
    RapportService.prototype.crearRapport = function (rapport) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (rapport.Id == 0) {
            return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers })
                .map(function (res) { return res.json(); })
                .catch(this.handleError);
        }
        else {
            return this.http.put(this._baseUrl, JSON.stringify(rapport), { headers: headers })
                .map(function (res) { return res.json(); })
                .catch(this.handleError);
        }
    };
    RapportService.prototype.getCliente = function (cliente, contacto) {
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        params.set('contacto', contacto);
        return this.http.get(this._clientesUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    RapportService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    return RapportService;
}());
RapportService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Http, Usuario])
], RapportService);
export { RapportService };
//# sourceMappingURL=Rapport.service.js.map