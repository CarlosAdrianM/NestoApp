import { Component, ViewChild } from '@angular/core';
import {NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import { UltimasVentasProductoCliente } from '../../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';
import { Keyboard } from '@ionic-native/keyboard';
import { ProductoComponent } from '../../pages/Producto/Producto.component';

@Component({
    templateUrl: 'SelectorPlantillaVentaDetalle.html',
})
export class SelectorPlantillaVentaDetalle {

  constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, toastCtrl: ToastController, private keyboard: Keyboard) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.cliente = navParams.get('cliente');
        this.almacen = navParams.get("almacen");
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;

        if (!this.producto.stockActualizado) {
            console.log("comprobar si existe el producto");
            this.comprobarSiExisteElProducto(this.producto, this.almacen);
        }
        // this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
        if (this.producto.cantidad === 0 && this.producto.cantidadOferta === 0) {
            console.log("Actualizar cantidad");
            this.actualizarCantidad(this.producto);
        } 
        this.actualizarDescuento(this.producto.descuento * 100);

    }

    @ViewChild('txtCantidad') myTxtCantidad;

    ngAfterViewInit() {
      this.setFocus();
    }


    public setFocus(): void {
      setTimeout(() => {
        this.myTxtCantidad.setFocus();
        this.keyboard.show();
      }, 400);
    }


    private errorMessage: string;
    private nav: NavController;
    private navParams: NavParams;
    public producto: any;
    private cliente: any;
    private servicio: SelectorPlantillaVentaService;
    public descuentoMostrar: string;
    private alertCtrl: AlertController;
    private toastCtrl: ToastController;
    public almacen: any;

    private comprobarSiExisteElProducto(producto: any, almacen: any): void {
        this.servicio.cargarStockProducto(this.producto, almacen).subscribe(
            data => {
                producto.stockActualizado = true;
                producto.stock = data.stock;
                producto.cantidadDisponible = data.cantidadDisponible;
                producto.urlImagen = data.urlImagen;
                console.log("Existe el producto y seleccionamos el color");
                this.seleccionarColorStock(producto);
            },
            error => { 
                this.errorMessage = <any>error;
                console.log("Error: " + error);
            }
        );
    }

    public actualizarCantidad(producto: any): void {
        if (producto.cantidadOferta > 0) {
            console.log("No aplicar descuento");
            producto.aplicarDescuento = false;
        } else {
            console.log("Guardamos aplicar descuento ficha");
            producto.aplicarDescuento = producto.aplicarDescuentoFicha;
        }

        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(
            data => {
                if (!this.producto.precioEstaModificado && producto.precio !== data.precio) {
                    console.log("Actualizamos precio");
                    producto.precio = data.precio;
                }
                if (producto.aplicarDescuento !== data.aplicarDescuento) {
                    producto.aplicarDescuento = data.aplicarDescuento;
                    console.log("Aplicar descuento es diferente");
                    if (!producto.aplicarDescuento && producto.descuento !== 0) {
                        producto.descuento = 0;
                        console.log("Hay descuento y lo actualizamos a cero");
                        this.actualizarDescuento(0);
                    }
                }
                if (producto.aplicarDescuento && producto.descuento !== data.descuento) {
                    producto.descuento = data.descuento;
                    console.log("Hay descuento y lo actualizamos con valor");
                    this.actualizarDescuento(producto.descuento * 100);
                }
                // if (producto.descuento < producto.descuentoProducto || !producto.aplicarDescuento) {
                //this.actualizarDescuento(producto.aplicarDescuento ? producto.descuentoProducto * 100 : 0);
                // }
            },
            error => { 
                this.errorMessage = <any>error;
                console.log("Error: " + error);
            }
        );

        this.seleccionarColorStock(producto);
    }

    public actualizarPrecio(): void {
        // Esto lo hacemos porque guarda el precio como string y da error
        this.producto.precio = +this.producto.precio;
        this.producto.precioEstaModificado = true;
    }

    private seleccionarColorStock(producto: any): void {
        let cantidad: number = producto.cantidad;
        let cantidadOferta: number = producto.cantidadOferta;
        cantidad = +cantidad;
        cantidadOferta = +cantidadOferta;

        console.log("Cantidad: " + cantidad + " + " + cantidadOferta);
        
        if (cantidad === 0 && cantidadOferta === 0) {
            producto.colorStock = 'default';
            console.log("Seleccionamos el color default");
        } else if (producto.cantidadDisponible >= cantidad + cantidadOferta) {
            producto.colorStock = 'secondary';
            console.log("Seleccionamos el color secondary");
        } else if (producto.stock >= cantidad + cantidadOferta) {
            producto.colorStock = 'dark';
            console.log("Seleccionamos el color dark");
        } else {
            producto.colorStock = 'danger';
            console.log("Seleccionamos el color danger");
        }
    }

    public actualizarDescuento(descuento: number): void {
        this.producto.descuento = descuento / 100;
        this.descuentoMostrar = descuento + '%';
    }
    
    public seleccionarTexto(evento: any): void {
        var nativeInputEle = evento._native.nativeElement;
        nativeInputEle.select();
        //evento.target.select();
    }

    public abrirUltimasVentas(): void {
        this.nav.push(UltimasVentasProductoCliente, { producto: this.producto.producto, cliente: this.cliente });
    }

    public sePuedeHacerDescuento(producto: any): boolean {
        return (producto.cantidadOferta === 0 || producto.cantidadOferta === "0") && producto.aplicarDescuento && producto.subGrupo.toLowerCase() !== 'otros aparatos';
    }

    public mostrarStock(producto: any): void {
        let texto: string;

        if (producto.stock == 0) {
            texto = 'No hay stock de este producto'
        } else if (producto.stock == producto.cantidadDisponible) {
            texto = 'Hay ' + producto.stock + ' unidades en stock y todas están disponibles.'
        } else {
            texto = 'Hay ' + producto.stock + ' unidades en stock, pero solo ' + producto.cantidadDisponible + ' están disponibles.'
        }

        let alert = this.alertCtrl.create({
            title: 'Stock',
            subTitle: texto,
            buttons: ['OK']
        });
        alert.present();
    }

    public abrirProducto(): void {
      this.nav.push(ProductoComponent, { empresa: "1", producto: this.producto.producto });
    }


}
