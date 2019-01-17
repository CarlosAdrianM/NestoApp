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
var ComisionesService = /** @class */ (function () {
    function ComisionesService(http) {
        this.http = http;
        this._baseUrl = Configuracion.API_URL + '/Comisiones';
    }
    ComisionesService.prototype.cargarResumen = function (vendedor, mes, anno, incluirAlbaranes) {
        var params = new URLSearchParams();
        params.set('vendedor', vendedor);
        params.set('mes', mes.toString());
        params.set('anno', anno.toString());
        params.set('incluirAlbaranes', incluirAlbaranes ? 'true' : 'false');
        return this.http.get(this._baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ComisionesService.prototype.cargarPrueba = function () {
        return { "$id": "1", "Vendedor": "IF", "Anno": 2018, "Mes": 3, "Etiquetas": [{ "$id": "2", "Nombre": "General", "Venta": 6656.2100, "Tipo": 0.072, "Comision": 479.25 }, { "$id": "3", "Nombre": "Lisap", "Venta": 3423.5300, "Tipo": 0.008, "Comision": 27.39 }], "GeneralFaltaParaSalto": 368.79, "GeneralProyeccion": 66562.1000, "TotalComisiones": 506.64 };
    };
    ComisionesService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    };
    ComisionesService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], ComisionesService);
    return ComisionesService;
}());
export { ComisionesService };
//# sourceMappingURL=Comisiones.service.js.map