var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
import { UltimasVentasProductoCliente } from '../../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';
import { Keyboard } from '@ionic-native/keyboard';
import { ProductoComponent } from '../../pages/Producto/Producto.component';
var SelectorPlantillaVentaDetalle = /** @class */ (function () {
    function SelectorPlantillaVentaDetalle(servicio, nav, navParams, alertCtrl, toastCtrl, keyboard) {
        this.keyboard = keyboard;
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.cliente = navParams.get('cliente');
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;
        if (!this.producto.stockActualizado) {
            console.log("comprobar Si existe el producto");
            this.comprobarSiExisteElProducto(this.producto);
        }
        // this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
        if (this.producto.cantidad === 0 && this.producto.cantidadOferta === 0) {
            console.log("Actualizar cantidad");
            this.actualizarCantidad(this.producto);
        }
        this.actualizarDescuento(this.producto.descuento * 100);
    }
    SelectorPlantillaVentaDetalle.prototype.ngAfterViewInit = function () {
        this.setFocus();
    };
    SelectorPlantillaVentaDetalle.prototype.setFocus = function () {
        var _this = this;
        setTimeout(function () {
            _this.myTxtCantidad.setFocus();
            _this.keyboard.show();
        }, 400);
    };
    SelectorPlantillaVentaDetalle.prototype.comprobarSiExisteElProducto = function (producto) {
        var _this = this;
        this.servicio.cargarStockProducto(this.producto).subscribe(function (data) {
            producto.stockActualizado = true;
            producto.stock = data.stock;
            producto.cantidadDisponible = data.cantidadDisponible;
            producto.urlImagen = data.urlImagen;
            console.log("Existe el producto y seleccionamos el color");
            _this.seleccionarColorStock(producto);
        }, function (error) {
            _this.errorMessage = error;
            console.log("Error: " + error);
        });
    };
    SelectorPlantillaVentaDetalle.prototype.actualizarCantidad = function (producto) {
        var _this = this;
        if (producto.cantidadOferta > 0) {
            console.log("No aplicar descuento");
            producto.aplicarDescuento = false;
        }
        else {
            console.log("Guardamos aplicar descuento ficha");
            producto.aplicarDescuento = producto.aplicarDescuentoFicha;
        }
        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(function (data) {
            if (!_this.producto.precioEstaModificado && producto.precio !== data.precio) {
                console.log("Actualizamos precio");
                producto.precio = data.precio;
            }
            if (producto.aplicarDescuento !== data.aplicarDescuento) {
                producto.aplicarDescuento = data.aplicarDescuento;
                console.log("Aplicar descuento es diferente");
                if (!producto.aplicarDescuento && producto.descuento !== 0) {
                    producto.descuento = 0;
                    console.log("Hay descuento y lo actualizamos a cero");
                    _this.actualizarDescuento(0);
                }
            }
            if (producto.aplicarDescuento && producto.descuento !== data.descuento) {
                producto.descuento = data.descuento;
                console.log("Hay descuento y lo actualizamos con valor");
                _this.actualizarDescuento(producto.descuento * 100);
            }
            // if (producto.descuento < producto.descuentoProducto || !producto.aplicarDescuento) {
            //this.actualizarDescuento(producto.aplicarDescuento ? producto.descuentoProducto * 100 : 0);
            // }
        }, function (error) {
            _this.errorMessage = error;
            console.log("Error: " + error);
        });
        this.seleccionarColorStock(producto);
    };
    SelectorPlantillaVentaDetalle.prototype.actualizarPrecio = function () {
        // Esto lo hacemos porque guarda el precio como string y da error
        this.producto.precio = +this.producto.precio;
        this.producto.precioEstaModificado = true;
    };
    SelectorPlantillaVentaDetalle.prototype.seleccionarColorStock = function (producto) {
        var cantidad = producto.cantidad;
        var cantidadOferta = producto.cantidadOferta;
        cantidad = +cantidad;
        cantidadOferta = +cantidadOferta;
        console.log("Cantidad: " + cantidad + " + " + cantidadOferta);
        if (cantidad === 0 && cantidadOferta === 0) {
            producto.colorStock = 'default';
            console.log("Seleccionamos el color default");
        }
        else if (producto.cantidadDisponible >= cantidad + cantidadOferta) {
            producto.colorStock = 'secondary';
            console.log("Seleccionamos el color secondary");
        }
        else if (producto.stock >= cantidad + cantidadOferta) {
            producto.colorStock = 'dark';
            console.log("Seleccionamos el color dark");
        }
        else {
            producto.colorStock = 'danger';
            console.log("Seleccionamos el color danger");
        }
    };
    SelectorPlantillaVentaDetalle.prototype.actualizarDescuento = function (descuento) {
        this.producto.descuento = descuento / 100;
        this.descuentoMostrar = descuento + '%';
    };
    SelectorPlantillaVentaDetalle.prototype.seleccionarTexto = function (evento) {
        var nativeInputEle = evento._native.nativeElement;
        nativeInputEle.select();
        //evento.target.select();
    };
    SelectorPlantillaVentaDetalle.prototype.abrirUltimasVentas = function () {
        this.nav.push(UltimasVentasProductoCliente, { producto: this.producto.producto, cliente: this.cliente });
    };
    SelectorPlantillaVentaDetalle.prototype.sePuedeHacerDescuento = function (producto) {
        return (producto.cantidadOferta === 0 || producto.cantidadOferta === "0") && producto.aplicarDescuento && producto.subGrupo.toLowerCase() !== 'otros aparatos';
    };
    SelectorPlantillaVentaDetalle.prototype.mostrarStock = function (producto) {
        var texto;
        if (producto.stock == 0) {
            texto = 'No hay stock de este producto';
        }
        else if (producto.stock == producto.cantidadDisponible) {
            texto = 'Hay ' + producto.stock + ' unidades en stock y todas están disponibles.';
        }
        else {
            texto = 'Hay ' + producto.stock + ' unidades en stock, pero solo ' + producto.cantidadDisponible + ' están disponibles.';
        }
        var alert = this.alertCtrl.create({
            title: 'Stock',
            subTitle: texto,
            buttons: ['OK']
        });
        alert.present();
    };
    SelectorPlantillaVentaDetalle.prototype.abrirProducto = function () {
        this.nav.push(ProductoComponent, { empresa: "1", producto: this.producto.producto });
    };
    __decorate([
        ViewChild('txtCantidad'),
        __metadata("design:type", Object)
    ], SelectorPlantillaVentaDetalle.prototype, "myTxtCantidad", void 0);
    SelectorPlantillaVentaDetalle = __decorate([
        Component({
            templateUrl: 'SelectorPlantillaVentaDetalle.html',
        }),
        __metadata("design:paramtypes", [SelectorPlantillaVentaService, NavController, NavParams, AlertController, ToastController, Keyboard])
    ], SelectorPlantillaVentaDetalle);
    return SelectorPlantillaVentaDetalle;
}());
export { SelectorPlantillaVentaDetalle };
//# sourceMappingURL=SelectorPlantillaVentaDetalle.js.map