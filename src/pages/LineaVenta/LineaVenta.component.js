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
import { NavParams, AlertController } from 'ionic-angular';
import { LineaVentaService } from './LineaVenta.service';
export var LineaVentaComponent = (function () {
    function LineaVentaComponent(navParams, servicio, alertCtrl) {
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.submitted = false;
        this.linea = navParams.get('linea');
        //this.actualizarDescuento(this.linea.descuento);
    }
    LineaVentaComponent.prototype.onSubmit = function () { this.submitted = true; };
    LineaVentaComponent.prototype.actualizarDescuento = function (dto) {
        this.descuentoNumero = dto / 100;
        this.descuentoCadena = dto + '%';
    };
    LineaVentaComponent.prototype.cambiarProducto = function (evento) {
        var _this = this;
        var nuevoProducto = evento.currentTarget.value;
        if (this.linea.producto == nuevoProducto) {
            return;
        }
        this.servicio.getProducto(nuevoProducto).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No existe el producto ' + nuevoProducto,
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.linea.producto = nuevoProducto;
                _this.linea.texto = data.nombre;
                _this.linea.precio = data.precio;
                console.log("Producto cambiado");
            }
        }, function (error) {
            // loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            // loading.dismiss();
        });
    };
    LineaVentaComponent = __decorate([
        Component({
            templateUrl: 'LineaVenta.html',
        }), 
        __metadata('design:paramtypes', [NavParams, LineaVentaService, AlertController])
    ], LineaVentaComponent);
    return LineaVentaComponent;
}());
//# sourceMappingURL=LineaVenta.component.js.map