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
import { ProductoService } from './Producto.service';
import { LoadingController, AlertController, NavParams } from 'ionic-angular';
var ProductoComponent = /** @class */ (function () {
    function ProductoComponent(servicio, loadingCtrl, alertCtrl, navParams) {
        this.servicio = servicio;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
        this.navParams = navParams;
        this.productoActual = "38651";
        if (navParams.get('producto')) {
            this.productoActual = navParams.get('producto');
        }
    }
    ProductoComponent.prototype.ngOnInit = function () {
        this.cargar();
    };
    ;
    ProductoComponent.prototype.cargar = function () {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Producto...',
        });
        loading.present();
        this.servicio.cargar("1", this.productoActual, true)
            .subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se ha cargado correctamente el producto',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.producto = data;
            }
        }, function (error) {
            loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    ProductoComponent.prototype.seleccionarTexto = function (evento) {
        var nativeInputEle = evento._native.nativeElement;
        nativeInputEle.select();
    };
    ProductoComponent = __decorate([
        Component({
            templateUrl: 'Producto.html',
        }),
        __metadata("design:paramtypes", [ProductoService,
            LoadingController, AlertController, NavParams])
    ], ProductoComponent);
    return ProductoComponent;
}());
export { ProductoComponent };
//# sourceMappingURL=Producto.component.js.map