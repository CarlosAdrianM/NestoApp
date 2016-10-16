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
var SelectorClientes_1 = require('../../componentes/SelectorClientes/SelectorClientes');
var ExtractoCliente_service_1 = require('./ExtractoCliente.service');
var ExtractoCliente = (function () {
    function ExtractoCliente(servicio) {
        this.mostrarClientes = true;
        this.resumenDeuda = {};
        this.servicio = servicio;
    }
    ;
    ExtractoCliente.prototype.cargarDeuda = function (cliente) {
        var _this = this;
        this.mostrarClientes = false;
        this.servicio.cargarDeuda(cliente).subscribe(function (data) {
            _this.movimientosDeuda = data;
            if (!data.length) {
                _this.errorMessage = 'Este cliente no tiene deuda';
                console.log('Este cliente no tiene deuda');
                return;
            }
            _this.resumenDeuda.total = 0;
            _this.resumenDeuda.impagados = 0;
            _this.resumenDeuda.vencida = 0;
            _this.resumenDeuda.abogado = 0;
            _this.hoy = new Date();
            for (var _i = 0, _a = _this.movimientosDeuda; _i < _a.length; _i++) {
                var mov = _a[_i];
                if (mov.tipo.trim() === '4') {
                    _this.resumenDeuda.impagados += mov.importePendiente;
                }
                if (mov.ruta && mov.ruta.trim() === 'AB') {
                    _this.resumenDeuda.abogado += mov.importePendiente;
                }
                if (mov.vencimiento < _this.hoy.toISOString()) {
                    _this.resumenDeuda.vencida += mov.importePendiente;
                }
                _this.resumenDeuda.total += mov.importePendiente;
                mov.vencimientoMostrar = new Date(mov.vencimiento);
            }
            console.log(_this.resumenDeuda);
        }, function (error) { return _this.errorMessage = error; });
    };
    ExtractoCliente = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/ExtractoCliente/ExtractoCliente.html',
            directives: [SelectorClientes_1.SelectorClientes],
            providers: [ExtractoCliente_service_1.ExtractoClienteService],
        }), 
        __metadata('design:paramtypes', [ExtractoCliente_service_1.ExtractoClienteService])
    ], ExtractoCliente);
    return ExtractoCliente;
}());
exports.ExtractoCliente = ExtractoCliente;
