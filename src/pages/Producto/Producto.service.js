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
var ProductoService = /** @class */ (function () {
    function ProductoService(http) {
        this.http = http;
        this._baseUrl = Configuracion.API_URL + '/Productos';
    }
    ProductoService.prototype.cargar = function (empresa, id, fichaCompleta) {
        var params = new URLSearchParams();
        params.set('empresa', empresa);
        params.set('id', id);
        params.set('fichaCompleta', fichaCompleta.toString());
        return this.http.get(this._baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    ProductoService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    };
    ProductoService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], ProductoService);
    return ProductoService;
}());
export { ProductoService };
//# sourceMappingURL=Producto.service.js.map