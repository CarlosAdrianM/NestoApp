"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var Parametros_service_1 = require('../../services/Parametros.service');
var PedidoVenta_service_1 = require('./PedidoVenta.service');
var SelectorFormasPago_1 = require('../../componentes/SelectorFormasPago/SelectorFormasPago');
var SelectorPlazosPago_1 = require('../../componentes/SelectorPlazosPago/SelectorPlazosPago');
var SelectorDireccionesEntrega_1 = require('../../componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega');
var PedidoVenta = (function () {
    function PedidoVenta(servicio, nav, navParams) {
        this.segmentoPedido = 'cabecera';
        this.nav = nav;
        this.servicio = servicio;
        this.cargarPedido(navParams.get('empresa'), navParams.get('numero'));
    }
    PedidoVenta.prototype.cargarPedido = function (empresa, numero) {
        var _this = this;
        var loading = ionic_angular_1.Loading.create({
            content: 'Cargando Pedido...',
        });
        this.nav.present(loading);
        this.servicio.cargarPedido(empresa, numero).subscribe(function (data) {
            _this.pedido = data;
            _this.pedido.fechaMostrar = new Date(_this.pedido.fecha);
            _this.pedido.primerVencimientoMostrar = new Date(_this.pedido.primerVencimiento);
            _this.iva = _this.pedido.iva;
        }, function (error) {
            var alert = ionic_angular_1.Alert.create({
                title: 'Error',
                subTitle: 'No se ha podido cargar el pedido',
                buttons: ['Ok'],
            });
            _this.nav.present(alert);
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
    PedidoVenta = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/PedidoVenta/PedidoVenta.html',
            providers: [PedidoVenta_service_1.PedidoVentaService, Parametros_service_1.Parametros],
            directives: [SelectorFormasPago_1.SelectorFormasPago, SelectorPlazosPago_1.SelectorPlazosPago, SelectorDireccionesEntrega_1.SelectorDireccionesEntrega],
        }), 
        __metadata('design:paramtypes', [PedidoVenta_service_1.PedidoVentaService, ionic_angular_1.NavController, ionic_angular_1.NavParams])
    ], PedidoVenta);
    return PedidoVenta;
}());
exports.PedidoVenta = PedidoVenta;
