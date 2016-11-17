var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Injectable, Input } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';
import { SelectorFormasPagoService } from './SelectorFormasPago.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export var SelectorFormasPago = (function (_super) {
    __extends(SelectorFormasPago, _super);
    function SelectorFormasPago(servicio, alertCtrl, loadingCtrl) {
        _super.call(this);
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
    }
    SelectorFormasPago.prototype.ngOnInit = function () {
        this.cargarDatos();
    };
    SelectorFormasPago.prototype.cargarDatos = function () {
        var _this = this;
        this.servicio.getFormasPago(this.cliente).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Error al cargar las formas de pago',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.inicializarDatos(data);
            }
        }, function (error) {
            // loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            // loading.dismiss();
        });
    };
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], SelectorFormasPago.prototype, "cliente", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], SelectorFormasPago.prototype, "seleccionado", void 0);
    SelectorFormasPago = __decorate([
        Component({
            selector: 'selector-formas-pago',
            templateUrl: 'SelectorFormasPago.html',
            // inputs: ['cliente', 'seleccionado'],
            outputs: ['seleccionar'],
        }),
        Injectable(), 
        __metadata('design:paramtypes', [SelectorFormasPagoService, AlertController, LoadingController])
    ], SelectorFormasPago);
    return SelectorFormasPago;
}(SelectorBase));
//# sourceMappingURL=SelectorFormasPago.js.map