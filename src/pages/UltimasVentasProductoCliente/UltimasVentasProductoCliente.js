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
var ionic_angular_1 = require('ionic-angular');
var UltimasVentasProductoCliente_service_1 = require('./UltimasVentasProductoCliente.service');
var UltimasVentasProductoCliente = (function () {
    function UltimasVentasProductoCliente(nav, servicio, navParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.servicio = servicio;
        this.cargarUltimasVentas(this.navParams.data.producto, this.navParams.data.cliente);
    }
    UltimasVentasProductoCliente.prototype.cargarUltimasVentas = function (cliente, producto) {
        var _this = this;
        this.servicio.cargarUltimasVentas(cliente, producto).subscribe(function (data) {
            _this.movimientos = data;
            for (var _i = 0, _a = _this.movimientos; _i < _a.length; _i++) {
                var mov = _a[_i];
                mov.fechaMostrar = new Date(mov.fecha);
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    UltimasVentasProductoCliente = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente.html',
            providers: [UltimasVentasProductoCliente_service_1.UltimasVentasProductoClienteService],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, UltimasVentasProductoCliente_service_1.UltimasVentasProductoClienteService, ionic_angular_1.NavParams])
    ], UltimasVentasProductoCliente);
    return UltimasVentasProductoCliente;
}());
exports.UltimasVentasProductoCliente = UltimasVentasProductoCliente;
