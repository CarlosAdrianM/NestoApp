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
import { PedidoVentaService } from './PedidoVenta.service';
import { LineaVentaComponent } from '../LineaVenta/LineaVenta.component';
import { LineaVenta } from '../LineaVenta/LineaVenta';
export var PedidoVentaComponent = (function () {
    function PedidoVentaComponent(servicio, nav, navParams, alertCtrl, loadingCtrl) {
        this.hoy = new Date();
        this.segmentoPedido = 'cabecera';
        this.nav = nav;
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarPedido(navParams.get('empresa'), navParams.get('numero'));
    }
    PedidoVentaComponent.prototype.cargarPedido = function (empresa, numero) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Pedido...',
        });
        loading.present();
        this.servicio.cargarPedido(empresa, numero).subscribe(function (data) {
            _this.pedido = data;
            for (var i = 0; i < _this.pedido.LineasPedido.length; i++) {
                _this.pedido.LineasPedido[i] = new LineaVenta(_this.pedido.LineasPedido[i]);
            }
            _this.iva = _this.pedido.iva;
            _this.pedido.plazosPago = _this.pedido.plazosPago.trim(); // Cambiar en la API
        }, function (error) {
            var alert = _this.alertCtrl.create({
                title: 'Error',
                subTitle: 'No se ha podido cargar el pedido de la empresa ' + empresa,
                buttons: ['Ok'],
            });
            alert.present();
            loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    PedidoVentaComponent.prototype.seleccionarFormaPago = function (evento) {
        this.pedido.formaPago = evento;
    };
    PedidoVentaComponent.prototype.cambiarIVA = function () {
        this.pedido.iva = this.pedido.iva ? undefined : this.iva;
    };
    PedidoVentaComponent.prototype.abrirLinea = function (linea) {
        console.log(linea);
        this.nav.push(LineaVentaComponent, { linea: linea });
    };
    PedidoVentaComponent.prototype.annadirLinea = function () {
        var linea = new LineaVenta();
        linea.copiarDatosPedido(this.pedido);
        this.abrirLinea(linea);
        this.pedido.LineasPedido = this.pedido.LineasPedido.concat(linea);
    };
    PedidoVentaComponent.prototype.modificarPedido = function () {
        var _this = this;
        var confirm = this.alertCtrl.create({
            title: 'Confirmar',
            message: '¿Está seguro que quiere modificar el pedido?',
            buttons: [
                {
                    text: 'Sí',
                    handler: function () {
                        // Hay que guardar el pedido original en alguna parte
                        var loading = _this.loadingCtrl.create({
                            content: 'Modificando Pedido...',
                        });
                        loading.present();
                        _this.servicio.modificarPedido(_this.pedido).subscribe(function (data) {
                            var alert = _this.alertCtrl.create({
                                title: 'Modificado',
                                subTitle: 'Pedido modificado correctamente',
                                buttons: ['Ok'],
                            });
                            alert.present();
                            loading.dismiss();
                            // this.reinicializar();
                        }, function (error) {
                            var alert = _this.alertCtrl.create({
                                title: 'Error',
                                subTitle: 'No se ha podido modificar el pedido',
                                buttons: ['Ok'],
                            });
                            alert.present();
                            loading.dismiss();
                        }, function () {
                            loading.dismiss();
                        });
                    }
                },
                {
                    text: 'No',
                    handler: function () {
                        return;
                    }
                }
            ]
        });
        confirm.present();
    };
    PedidoVentaComponent.prototype.cadenaFecha = function (cadena) {
        return new Date(cadena);
    };
    PedidoVentaComponent = __decorate([
        Component({
            templateUrl: 'PedidoVenta.html',
        }), 
        __metadata('design:paramtypes', [PedidoVentaService, NavController, NavParams, AlertController, LoadingController])
    ], PedidoVentaComponent);
    return PedidoVentaComponent;
}());
//# sourceMappingURL=PedidoVenta.component.js.map