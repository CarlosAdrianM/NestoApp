var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
import { Component, Injectable, Input } from '@angular/core';
import { AlertController, NavController, LoadingController } from 'ionic-angular';
import { SelectorVendedoresService } from './SelectorVendedores.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
var SelectorVendedoresComponent = /** @class */ (function (_super) {
    __extends(SelectorVendedoresComponent, _super);
    function SelectorVendedoresComponent(servicio, nav, alertCtrl, loadingCtrl) {
        var _this = _super.call(this) || this;
        _this.nav = nav;
        _this.servicio = servicio;
        _this.alertCtrl = alertCtrl;
        _this.loadingCtrl = loadingCtrl;
        return _this;
    }
    SelectorVendedoresComponent.prototype.ngOnInit = function () {
        this.cargarDatos();
    };
    SelectorVendedoresComponent.prototype.cargarDatos = function () {
        var _this = this;
        this.servicio.getVendedores().subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Error al cargar vendedores',
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
        __metadata("design:type", Object)
    ], SelectorVendedoresComponent.prototype, "seleccionado", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], SelectorVendedoresComponent.prototype, "etiqueta", void 0);
    SelectorVendedoresComponent = __decorate([
        Component({
            selector: 'selector-vendedores',
            templateUrl: 'SelectorVendedores.html',
            outputs: ['seleccionar'],
        }),
        Injectable(),
        __metadata("design:paramtypes", [SelectorVendedoresService, NavController, AlertController, LoadingController])
    ], SelectorVendedoresComponent);
    return SelectorVendedoresComponent;
}(SelectorBase));
export { SelectorVendedoresComponent };
//# sourceMappingURL=SelectorVendedores.component.js.map