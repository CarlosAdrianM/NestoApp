var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@angular/core";
import { Http, URLSearchParams } from "@angular/http";
import { Configuracion } from "../configuracion/configuracion";
import { Observable } from "rxjs/Observable";
var SelectorProductosService = /** @class */ (function () {
    function SelectorProductosService(http) {
        this.http = http;
        this._consultaUrl = Configuracion.API_URL + '/Productos';
    }
    ;
    SelectorProductosService.prototype.getProductos = function (filtro) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('filtroProducto', filtro);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
        //let params: URLSearchParams = new URLSearchParams();
        //params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        //params.set('filtro', filtro);
        //params.set('filtroNombre', filtro[0]);
        //params.set('filtroFamilia', filtro[1]);
        //params.set('filtroSubgrupo', filtro[2]);
    };
    SelectorProductosService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    SelectorProductosService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], SelectorProductosService);
    return SelectorProductosService;
}());
export { SelectorProductosService };
//# sourceMappingURL=SelectorProductos.service.js.map