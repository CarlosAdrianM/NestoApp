// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaPedidosVentaService } from './ListaPedidosVenta.service';
import { PedidoVentaComponent } from '../PedidoVenta/PedidoVenta.component';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
var ListaPedidosVenta = (function (_super) {
    __extends(ListaPedidosVenta, _super);
    function ListaPedidosVenta(servicio, nav, alertCtrl, loadingCtrl) {
        var _this = _super.call(this) || this;
        _this.servicio = servicio;
        _this.nav = nav;
        _this.alertCtrl = alertCtrl;
        _this.loadingCtrl = loadingCtrl;
        _this.cargarDatos(''); // El parámetro no se usa para nada
        return _this;
    }
    ListaPedidosVenta.prototype.abrirPedido = function (pedido) {
        this.nav.push(PedidoVentaComponent, { empresa: pedido.empresa, numero: pedido.numero });
    };
    ListaPedidosVenta.prototype.abrirPedidoNumero = function (numeroPedido) {
        this.nav.push(PedidoVentaComponent, { empresa: "1", numero: numeroPedido });
    };
    ListaPedidosVenta.prototype.cargarDatos = function (nada) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Pedidos...',
        });
        loading.present();
        this.servicio.cargarLista().subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No hay ningún pedido pendiente de servir',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.inicializarDatos(data);
            }
        }, function (error) {
            loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            loading.dismiss();
        });
    };
    return ListaPedidosVenta;
}(SelectorBase));
ListaPedidosVenta = __decorate([
    Component({
        templateUrl: 'ListaPedidosVenta.html',
    }),
    __metadata("design:paramtypes", [ListaPedidosVentaService, NavController, AlertController, LoadingController])
], ListaPedidosVenta);
export { ListaPedidosVenta };
//# sourceMappingURL=ListaPedidosVenta.js.map