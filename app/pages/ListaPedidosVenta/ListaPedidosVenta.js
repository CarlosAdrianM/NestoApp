// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes
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
// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
var ionic_angular_1 = require('ionic-angular');
var Parametros_service_1 = require('../../services/Parametros.service');
var ListaPedidosVenta_service_1 = require('./ListaPedidosVenta.service');
var PedidoVenta_1 = require('../PedidoVenta/PedidoVenta');
var ListaPedidosVenta = (function () {
    function ListaPedidosVenta(servicio, nav) {
        this.servicio = servicio;
        this.nav = nav;
        this.cargarLista();
    }
    ListaPedidosVenta.prototype.abrirPedido = function (pedido) {
        this.nav.push(PedidoVenta_1.PedidoVenta, { empresa: pedido.empresa, numero: pedido.numero });
    };
    ListaPedidosVenta.prototype.cargarLista = function () {
        var _this = this;
        var loading = ionic_angular_1.Loading.create({
            content: 'Cargando Pedidos...',
        });
        this.nav.present(loading);
        this.servicio.cargarLista().subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'No hay ningún pedido pendiente de servir',
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_1);
            }
            else {
                _this.listaPedidos = data;
            }
        }, function (error) {
            loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            loading.dismiss();
        });
    };
    ListaPedidosVenta = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/ListaPedidosVenta/ListaPedidosVenta.html',
            providers: [ListaPedidosVenta_service_1.ListaPedidosVentaService, Parametros_service_1.Parametros],
        }), 
        __metadata('design:paramtypes', [ListaPedidosVenta_service_1.ListaPedidosVentaService, ionic_angular_1.NavController])
    ], ListaPedidosVenta);
    return ListaPedidosVenta;
}());
exports.ListaPedidosVenta = ListaPedidosVenta;
