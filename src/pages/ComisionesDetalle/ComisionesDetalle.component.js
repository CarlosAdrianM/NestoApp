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
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesDetalleService } from './ComisionesDetalle.service';
import { PedidoVentaComponent } from '../PedidoVenta/PedidoVenta.component';
var ComisionesDetalleComponent = /** @class */ (function () {
    function ComisionesDetalleComponent(servicio, nav, navParams, alertCtrl, loadingCtrl) {
        this.servicio = servicio;
        this.nav = nav;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarDetalle(navParams.get('vendedor'), navParams.get('anno'), navParams.get('mes'), navParams.get('incluirAlbaranes'), navParams.get('etiqueta'));
    }
    ComisionesDetalleComponent.prototype.cargarDetalle = function (vendedor, anno, mes, incluirAlbaranes, etiqueta) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Comisiones...',
        });
        loading.present();
        this.servicio.cargarDetalle(vendedor, anno, mes, incluirAlbaranes, etiqueta)
            .subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se han cargado correctamente las comisiones',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.listaDetalleComision = data;
            }
        }, function (error) {
            loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    ComisionesDetalleComponent.prototype.abrirPedido = function (detalle) {
        this.nav.push(PedidoVentaComponent, { empresa: detalle.Empresa, numero: detalle.Pedido });
    };
    ComisionesDetalleComponent = __decorate([
        Component({
            templateUrl: 'ComisionesDetalle.html',
        }),
        __metadata("design:paramtypes", [ComisionesDetalleService, NavController,
            NavParams, AlertController,
            LoadingController])
    ], ComisionesDetalleComponent);
    return ComisionesDetalleComponent;
}());
export { ComisionesDetalleComponent };
//# sourceMappingURL=ComisionesDetalle.component.js.map