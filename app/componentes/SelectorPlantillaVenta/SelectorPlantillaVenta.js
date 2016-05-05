"use strict";
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
var core_1 = require('angular2/core');
var ionic_angular_1 = require('ionic-angular');
var SelectorPlantillaVenta_service_1 = require('./SelectorPlantillaVenta.service');
var SelectorBase_1 = require('../SelectorBase/SelectorBase');
var SelectorPlantillaVentaDetalle_1 = require('./SelectorPlantillaVentaDetalle');
var SelectorPlantillaVenta = (function (_super) {
    __extends(SelectorPlantillaVenta, _super);
    function SelectorPlantillaVenta(servicio, nav) {
        _super.call(this);
        this._baseImponiblePedido = 0;
        this.servicio = servicio;
        this.nav = nav;
    }
    SelectorPlantillaVenta.prototype.cargarDatos = function (cliente) {
        var _this = this;
        var loading = ionic_angular_1.Loading.create({
            content: 'Cargando Productos...',
        });
        this.nav.present(loading);
        this.servicio.getProductos(cliente).subscribe(function (data) {
            data = data.map(function (item) {
                var clone = Object.assign({}, item); // Objects are pass by referenced, hence, you need to clone object
                clone.aplicarDescuentoFicha = clone.aplicarDescuento;
                return clone;
            });
            _this.inicializarDatos(data);
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'Este cliente no tiene histórico de compras',
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_1);
            }
        }, function (error) {
            loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            loading.dismiss();
        });
    };
    SelectorPlantillaVenta.prototype.abrirDetalle = function (producto) {
        this.agregarDato(producto);
        this.nav.push(SelectorPlantillaVentaDetalle_1.SelectorPlantillaVentaDetalle, { producto: producto, cliente: this.cliente });
    };
    SelectorPlantillaVenta.prototype.cargarResumen = function () {
        var productosResumen = [];
        this.baseImponiblePedido = 0;
        for (var _i = 0, _a = this.datosIniciales(); _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.cantidad !== 0 || value.cantidadOferta !== 0) {
                productosResumen.push(value);
                this.baseImponiblePedido += value.cantidad * value.precio * (1 - value.descuento);
            }
        }
        return productosResumen;
    };
    SelectorPlantillaVenta.prototype.ngOnChanges = function () {
        this.cargarDatos(this.cliente);
    };
    SelectorPlantillaVenta.prototype.buscarEnTodosLosProductos = function (filtro) {
        var _this = this;
        this.servicio.buscarProductos(filtro).subscribe(function (data) {
            if (data.length === 0) {
                var alert_2 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'No hay productos que coincidan con ' + filtro,
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_2);
            }
            else {
                _this.inicializarDatosFiltrados(data);
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    Object.defineProperty(SelectorPlantillaVenta.prototype, "totalPedido", {
        get: function () {
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
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectorPlantillaVenta.prototype, "cliente", void 0);
    SelectorPlantillaVenta = __decorate([
        core_1.Component({
            selector: 'selector-plantilla-venta',
            templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVenta.html',
            directives: [ionic_angular_1.Searchbar, ionic_angular_1.List, ionic_angular_1.Item, ionic_angular_1.Button, ionic_angular_1.Toggle, ionic_angular_1.Content],
            providers: [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService],
            inputs: ['cliente'],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService, ionic_angular_1.NavController])
    ], SelectorPlantillaVenta);
    return SelectorPlantillaVenta;
}(SelectorBase_1.SelectorBase));
exports.SelectorPlantillaVenta = SelectorPlantillaVenta;
