var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { ExtractoClienteService } from './ExtractoCliente.service';
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
                if (mov.vencimiento < _this.hoy.toISOString()) {
                    _this.resumenDeuda.vencida += mov.importePendiente;
                }
                if ((!mov.estado) || (mov.estado && mov.estado.trim() !== "DVD")) {
                    _this.resumenDeuda.total += mov.importePendiente;
                    if (mov.ruta && mov.ruta.trim() === 'AB') {
                        _this.resumenDeuda.abogado += mov.importePendiente;
                    }
                }
            }
            console.log(_this.resumenDeuda);
        }, function (error) { return _this.errorMessage = error; });
    };
    return ExtractoCliente;
}());
ExtractoCliente = __decorate([
    Component({
        templateUrl: 'ExtractoCliente.html',
    }),
    __metadata("design:paramtypes", [ExtractoClienteService])
], ExtractoCliente);
export { ExtractoCliente };
//# sourceMappingURL=ExtractoCliente.js.map