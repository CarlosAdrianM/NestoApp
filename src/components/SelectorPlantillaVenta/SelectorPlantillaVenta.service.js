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
import { Configuracion } from '../configuracion/configuracion';
export var SelectorPlantillaVentaService = (function () {
    function SelectorPlantillaVentaService(http) {
        this.http = http;
    }
    SelectorPlantillaVentaService.prototype.getProductos = function (cliente) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorPlantillaVentaService.prototype.cargarStockProducto = function (producto) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas/CargarStocks';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('almacen', Configuracion.ALMACEN_POR_DEFECTO);
        params.set('productoStock', producto.producto);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorPlantillaVentaService.prototype.buscarProductos = function (filtro) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('filtroProducto', filtro);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorPlantillaVentaService.prototype.actualizarPrecioProducto = function (producto, cliente) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas/CargarPrecio';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        params.set('contacto', '0'); // porque aún no sabemos la dirección de entrega
        params.set('productoPrecio', producto.producto);
        params.set('cantidad', producto.cantidad);
        params.set('aplicarDescuento', producto.aplicarDescuento); //¿aplicarDescuentoFicha?
        // params.set('aplicarDescuento', producto.cantidadOferta === 0  ? producto.aplicarDescuento : false);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorPlantillaVentaService.prototype.comprobarCondicionesPrecio = function (linea) {
        var _baseUrl = Configuracion.API_URL + '/PlantillaVentas/ComprobarCondiciones';
        var params = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('producto', linea.producto);
        params.set('aplicarDescuento', linea.aplicarDescuento);
        params.set('precio', linea.precio);
        params.set('descuento', linea.descuento);
        params.set('cantidad', linea.cantidad);
        params.set('cantidadOferta', linea.cantidadOferta);
        return this.http.get(_baseUrl, { search: params })
            .map(function (res) { return res.json(); })
            .catch(this.handleError);
    };
    SelectorPlantillaVentaService.prototype.handleError = function (error) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    SelectorPlantillaVentaService = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [Http])
    ], SelectorPlantillaVentaService);
    return SelectorPlantillaVentaService;
}());
//# sourceMappingURL=SelectorPlantillaVenta.service.js.map