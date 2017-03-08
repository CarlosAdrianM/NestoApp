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
import { Component, Input } from '@angular/core';
import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
import { SelectorPlantillaVentaDetalle } from './SelectorPlantillaVentaDetalle';
var SelectorPlantillaVenta = (function (_super) {
    __extends(SelectorPlantillaVenta, _super);
    function SelectorPlantillaVenta(servicio, alertCtrl, loadingCtrl, nav) {
        var _this = _super.call(this) || this;
        _this._baseImponiblePedido = 0;
        _this._baseImponibleParaPortes = 0;
        _this.servicio = servicio;
        _this.alertCtrl = alertCtrl;
        _this.loadingCtrl = loadingCtrl;
        _this.nav = nav;
        return _this;
    }
    SelectorPlantillaVenta.prototype.cargarDatos = function (cliente) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Productos...',
        });
        loading.present();
        this.servicio.getProductos(cliente).subscribe(function (data) {
            data = data.map(function (item) {
                var clone = Object.assign({}, item); // Objects are pass by referenced, hence, you need to clone object
                clone.aplicarDescuentoFicha = clone.aplicarDescuento;
                clone.esSobrePedido = clone.estado != 0;
                return clone;
            });
            _this.inicializarDatos(data);
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Este cliente no tiene histórico de compras',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
        }, function (error) {
            loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            loading.dismiss();
        });
    };
    SelectorPlantillaVenta.prototype.abrirDetalle = function (producto) {
        if (this.agregarDato(producto)) {
            console.log("Agregado dato");
            producto.aplicarDescuentoFicha = producto.aplicarDescuento;
        }
        this.nav.push(SelectorPlantillaVentaDetalle, { producto: producto, cliente: this.cliente });
    };
    SelectorPlantillaVenta.prototype.cargarResumen = function () {
        var productosResumen = [];
        this.baseImponiblePedido = 0;
        this.baseImponibleParaPortes = 0;
        for (var _i = 0, _a = this.datosIniciales(); _i < _a.length; _i++) {
            var value = _a[_i];
            if (+value.cantidad !== 0 || +value.cantidadOferta !== 0) {
                productosResumen.push(value);
                console.log("Nº elementos en resumen: " + productosResumen.length);
                value.esSobrePedido = !(value.estado == 0 || (value.stockActualizado && value.cantidadDisponible >= +value.cantidad + value.cantidadOferta));
                if (!value.stockActualizado) {
                    value.colorSobrePedido = 'default';
                }
                else if (value.esSobrePedido) {
                    value.colorSobrePedido = 'danger';
                }
                else {
                    value.colorSobrePedido = 'none';
                }
                this.baseImponiblePedido += value.cantidad * value.precio * (1 - value.descuento);
                if (!value.esSobrePedido) {
                    this.baseImponibleParaPortes += value.cantidad * value.precio * (1 - value.descuento);
                }
            }
        }
        console.log("Productos resumen: " + productosResumen.toString());
        return productosResumen;
    };
    SelectorPlantillaVenta.prototype.ngOnChanges = function (changes) {
        this.cargarDatos(this.cliente);
    };
    SelectorPlantillaVenta.prototype.buscarEnTodosLosProductos = function (filtro) {
        var _this = this;
        this.servicio.buscarProductos(filtro).subscribe(function (data) {
            if (data.length === 0) {
                var alert_2 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No hay productos que coincidan con ' + filtro,
                    buttons: ['Ok'],
                });
                alert_2.present();
            }
            else {
                _this.inicializarDatosFiltrados(data);
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    Object.defineProperty(SelectorPlantillaVenta.prototype, "totalPedido", {
        get: function () {
            // Hay que calcularlo bien
            return this._baseImponiblePedido * 1.21;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectorPlantillaVenta.prototype, "baseImponiblePedido", {
        get: function () {
            return this._baseImponiblePedido;
        },
        set: function (value) {
            this._baseImponiblePedido = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectorPlantillaVenta.prototype, "baseImponibleParaPortes", {
        get: function () {
            return this._baseImponibleParaPortes;
        },
        set: function (value) {
            this._baseImponibleParaPortes = value;
        },
        enumerable: true,
        configurable: true
    });
    return SelectorPlantillaVenta;
}(SelectorBase));
__decorate([
    Input(),
    __metadata("design:type", Object)
], SelectorPlantillaVenta.prototype, "cliente", void 0);
SelectorPlantillaVenta = __decorate([
    Component({
        selector: 'selector-plantilla-venta',
        templateUrl: 'SelectorPlantillaVenta.html',
    }),
    __metadata("design:paramtypes", [SelectorPlantillaVentaService, AlertController, LoadingController, NavController])
], SelectorPlantillaVenta);
export { SelectorPlantillaVenta };
//# sourceMappingURL=SelectorPlantillaVenta.js.map