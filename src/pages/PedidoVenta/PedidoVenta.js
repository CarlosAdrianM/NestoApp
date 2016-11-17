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
//import { SelectorFormasPago } from '../../components/SelectorFormasPago/SelectorFormasPago';
//import { SelectorPlazosPago } from '../../components/SelectorPlazosPago/SelectorPlazosPago';
//import {SelectorDireccionesEntrega} from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega';
export var PedidoVenta = (function () {
    function PedidoVenta(servicio, nav, navParams, alertCtrl, loadingCtrl) {
        this.hoy = new Date();
        this.segmentoPedido = 'cabecera';
        this.nav = nav;
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarPedido(navParams.get('empresa'), navParams.get('numero'));
    }
    PedidoVenta.prototype.cargarPedido = function (empresa, numero) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Pedido...',
        });
        loading.present();
        this.servicio.cargarPedido(empresa, numero).subscribe(function (data) {
            _this.pedido = data;
            //this.pedido.fechaMostrar = new Date(this.pedido.fecha);
            //this.pedido.primerVencimientoMostrar = new Date(this.pedido.primerVencimiento);
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
    PedidoVenta.prototype.seleccionarFormaPago = function (evento) {
        this.pedido.formaPago = evento;
    };
    PedidoVenta.prototype.cambiarIVA = function () {
        this.pedido.iva = this.pedido.iva ? undefined : this.iva;
    };
    PedidoVenta.prototype.annadirLinea = function () {
        var alert = this.alertCtrl.create({
            title: 'Añadir Líneas',
            subTitle: 'Parte de la aplicación no implementada aún. En próximas versiones se permitirá ampliar pedidos.',
            buttons: ['Ok'],
        });
        alert.present();
    };
    PedidoVenta.prototype.modificarPedido = function () {
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
    PedidoVenta.prototype.cadenaFecha = function (cadena) {
        return new Date(cadena);
    };
    PedidoVenta = __decorate([
        Component({
            templateUrl: 'PedidoVenta.html',
        }), 
        __metadata('design:paramtypes', [PedidoVentaService, NavController, NavParams, AlertController, LoadingController])
    ], PedidoVenta);
    return PedidoVenta;
}());
//# sourceMappingURL=PedidoVenta.js.map