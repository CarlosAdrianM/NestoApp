var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { SelectorDireccionesEntregaService } from './SelectorDireccionesEntrega.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
var SelectorDireccionesEntrega = (function (_super) {
    __extends(SelectorDireccionesEntrega, _super);
    function SelectorDireccionesEntrega(servicio, alertCtrl) {
        var _this = _super.call(this) || this;
        _this.seleccionado = "0";
        _this.servicio = servicio;
        _this.alertCtrl = alertCtrl;
        return _this;
    }
    SelectorDireccionesEntrega.prototype.cargarDatos = function (cliente) {
        var _this = this;
        if (!cliente) {
            return;
        }
        this.servicio.direccionesEntrega(cliente).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'El cliente ' + cliente.cliente + ' no tiene ninguna dirección de entrega',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.direccionesEntrega = data;
                _this.direccionSeleccionada = undefined;
                var i = 0;
                while (_this.direccionSeleccionada === undefined) {
                    if (i + 1 > _this.direccionesEntrega.length) {
                        throw 'Error en la API de Nesto: cliente sin dirección por defecto';
                    }
                    if (_this.seleccionado === undefined) {
                        if (_this.direccionesEntrega[i].esDireccionPorDefecto) {
                            _this.direccionSeleccionada = _this.direccionesEntrega[i];
                            _this.seleccionarDato(_this.direccionSeleccionada);
                        }
                    }
                    else {
                        if (_this.seleccionado && _this.direccionesEntrega[i].contacto && _this.seleccionado.trim() === _this.direccionesEntrega[i].contacto.trim()) {
                            _this.direccionSeleccionada = _this.direccionesEntrega[i];
                            _this.seleccionarDato(_this.direccionSeleccionada);
                        }
                    }
                    i++;
                }
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    SelectorDireccionesEntrega.prototype.seleccionarDireccion = function (direccion) {
        this.direccionSeleccionada = direccion;
        this.seleccionarDato(direccion);
    };
    SelectorDireccionesEntrega.prototype.ngOnChanges = function (changes) {
        this.cargarDatos(this.cliente);
    };
    return SelectorDireccionesEntrega;
}(SelectorBase));
SelectorDireccionesEntrega = __decorate([
    Component({
        selector: 'selector-direcciones-entrega',
        templateUrl: 'SelectorDireccionesEntrega.html',
        inputs: ['cliente', 'seleccionado'],
        outputs: ['seleccionar'],
    }),
    Injectable(),
    __metadata("design:paramtypes", [SelectorDireccionesEntregaService, AlertController])
], SelectorDireccionesEntrega);
export { SelectorDireccionesEntrega };
//# sourceMappingURL=SelectorDireccionesEntrega.js.map