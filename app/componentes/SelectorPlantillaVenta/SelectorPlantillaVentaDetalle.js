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
var SelectorPlantillaVenta_service_1 = require('./SelectorPlantillaVenta.service');
var UltimasVentasProductoCliente_1 = require('../../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente');
var SelectorPlantillaVentaDetalle = (function () {
    function SelectorPlantillaVentaDetalle(servicio, nav, navParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.cliente = navParams.get('cliente');
        this.servicio = servicio;
        if (!this.producto.stockActualizado) {
            this.comprobarSiExisteElProducto(this.producto);
        }
        // this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
        this.actualizarCantidad(this.producto);
    }
    SelectorPlantillaVentaDetalle.prototype.comprobarSiExisteElProducto = function (producto) {
        var _this = this;
        this.servicio.cargarStockProducto(this.producto).subscribe(function (data) {
            producto.stockActualizado = true;
            producto.stock = data.stock;
            producto.cantidadDisponible = data.cantidadDisponible;
            producto.urlImagen = data.urlImagen;
            _this.seleccionarColorStock(producto);
        }, function (error) { return _this.errorMessage = error; });
    };
    SelectorPlantillaVentaDetalle.prototype.actualizarCantidad = function (producto) {
        var _this = this;
        if (producto.cantidadOferta > 0) {
            producto.aplicarDescuento = false;
        }
        else {
            producto.aplicarDescuento = producto.aplicarDescuentoFicha;
        }
        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(function (data) {
            producto.precio = data.precio;
            producto.descuentoProducto = data.descuento;
            producto.aplicarDescuento = data.aplicarDescuento;
            if (producto.descuento < producto.descuentoProducto || !producto.aplicarDescuento) {
                _this.actualizarDescuento(producto.aplicarDescuento ? producto.descuentoProducto * 100 : 0);
            }
        }, function (error) { return _this.errorMessage = error; });
        this.seleccionarColorStock(producto);
    };
    SelectorPlantillaVentaDetalle.prototype.seleccionarColorStock = function (producto) {
        var cantidad = producto.cantidad;
        var cantidadOferta = producto.cantidadOferta;
        cantidad = +cantidad;
        cantidadOferta = +cantidadOferta;
        if (cantidad === 0 && cantidadOferta === 0) {
            producto.colorStock = 'default';
        }
        else if (producto.cantidadDisponible >= cantidad + cantidadOferta) {
            producto.colorStock = 'secondary';
        }
        else if (producto.stock >= cantidad + cantidadOferta) {
            producto.colorStock = 'dark';
        }
        else {
            producto.colorStock = 'danger';
        }
    };
    SelectorPlantillaVentaDetalle.prototype.actualizarDescuento = function (descuento) {
        this.producto.descuento = descuento / 100;
        this.descuentoMostrar = descuento + '%';
    };
    SelectorPlantillaVentaDetalle.prototype.seleccionarTexto = function (evento) {
        evento.target.select();
    };
    SelectorPlantillaVentaDetalle.prototype.abrirUltimasVentas = function () {
        this.nav.push(UltimasVentasProductoCliente_1.UltimasVentasProductoCliente, { producto: this.producto.producto, cliente: this.cliente });
    };
    SelectorPlantillaVentaDetalle.prototype.sePuedeHacerDescuento = function (producto) {
        return producto.aplicarDescuento && producto.subGrupo !== 'Otros aparatos';
    };
    SelectorPlantillaVentaDetalle = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle.html',
            providers: [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService],
        }), 
        __metadata('design:paramtypes', [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService, ionic_angular_1.NavController, ionic_angular_1.NavParams])
    ], SelectorPlantillaVentaDetalle);
    return SelectorPlantillaVentaDetalle;
}());
exports.SelectorPlantillaVentaDetalle = SelectorPlantillaVentaDetalle;
