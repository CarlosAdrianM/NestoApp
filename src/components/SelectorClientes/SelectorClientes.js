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
import { Component, Injectable, Output, EventEmitter } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';
import { SelectorClientesService } from './SelectorClientes.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export var SelectorClientes = (function (_super) {
    __extends(SelectorClientes, _super);
    function SelectorClientes(servicio, loadingCtrl, alertCtrl) {
        _super.call(this);
        this.seleccionar = new EventEmitter();
        this.servicio = servicio;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
    }
    SelectorClientes.prototype.cargarDatos = function (filtro) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Clientes...',
        });
        loading.present();
        this.servicio.getClientes(filtro).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se encuentra ningún cliente que coincida con ' + filtro,
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
            loading.dismiss();
        });
    };
    __decorate([
        Output(), 
        __metadata('design:type', Object)
    ], SelectorClientes.prototype, "seleccionar", void 0);
    SelectorClientes = __decorate([
        Component({
            selector: 'selector-clientes',
            templateUrl: 'SelectorClientes.html',
        }),
        Injectable(), 
        __metadata('design:paramtypes', [SelectorClientesService, LoadingController, AlertController])
    ], SelectorClientes);
    return SelectorClientes;
}(SelectorBase));
//# sourceMappingURL=SelectorClientes.js.map