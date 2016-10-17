import { Component, ViewChild, OnInit } from '@angular/core';
import {NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import { UltimasVentasProductoCliente } from '../../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';

@Component({
    templateUrl: 'SelectorPlantillaVentaDetalle.html',
})
export class SelectorPlantillaVentaDetalle {
    @ViewChild('cantidadInput') cantidadInput;

    constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, toastCtrl: ToastController) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.cliente = navParams.get('cliente');
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.toastCtrl = toastCtrl;

        if (!this.producto.stockActualizado) {
            this.comprobarSiExisteElProducto(this.producto);
        }
        // this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
        if (this.producto.cantidad === 0 && this.producto.cantidadOferta === 0) {
            this.actualizarCantidad(this.producto);
        } 
        this.actualizarDescuento(this.producto.descuento * 100);

    }

    ngOnInit() {
        this.cantidadInput.setFocus();
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

    private comprobarSiExisteElProducto(producto: any): void {
        this.servicio.cargarStockProducto(this.producto).subscribe(
            data => {
                producto.stockActualizado = true;
                producto.stock = data.stock;
                producto.cantidadDisponible = data.cantidadDisponible;
                producto.urlImagen = data.urlImagen;
                this.seleccionarColorStock(producto);
            },
            error => this.errorMessage = <any>error
        );
    }

    public actualizarCantidad(producto: any): void {
        if (producto.cantidadOferta > 0) {
            producto.aplicarDescuento = false;
        } else {
            producto.aplicarDescuento = producto.aplicarDescuentoFicha;
        }

        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(
            data => {
                if (!this.producto.precioEstaModificado && producto.precio !== data.precio) {
                    producto.precio = data.precio;
                }
                if (producto.aplicarDescuento !== data.aplicarDescuento) {
                    producto.aplicarDescuento = data.aplicarDescuento;
                    if (!producto.aplicarDescuento && producto.descuento !== 0) {
                        producto.descuento = 0;
                        this.actualizarDescuento(0);
                    }
                }
                if (producto.aplicarDescuento && producto.descuento !== data.descuento) {
                    producto.descuento = data.descuento;
                    this.actualizarDescuento(producto.descuento * 100);
                }
                // if (producto.descuento < producto.descuentoProducto || !producto.aplicarDescuento) {
                //this.actualizarDescuento(producto.aplicarDescuento ? producto.descuentoProducto * 100 : 0);
                // }
            },
            error => this.errorMessage = <any>error
        );

        this.comprobarCondicionesPrecio();

        this.seleccionarColorStock(producto);
    }

    public actualizarPrecio(): void {
        // Esto lo hacemos porque guarda el precio como string y da error
        this.producto.precio = +this.producto.precio;
        this.producto.precioEstaModificado = true;
        this.comprobarCondicionesPrecio();
    }

    private comprobarCondicionesPrecio(): void {
        if (this.producto.cantidad === 0 && this.producto.cantidadOferta === 0) {
            return;
        }
        this.servicio.comprobarCondicionesPrecio(this.producto).subscribe(
            data => {
                if (data.motivo && data.motivo !== '') {
                    /*
                    let alert: Alert = Alert.create({
                        title: 'Gestor de Precios',
                        subTitle: data.motivo,
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                    */
                    if(this.producto.precio !== data.precio) {
                        this.producto.precio = data.precio;
                        this.producto.precioEstaModificado = false;
                    }
                    if (this.producto.aplicarDescuento !== data.aplicarDescuento) {
                        this.producto.aplicarDescuento = data.aplicarDescuento;
                    }
                    if (this.producto.cantidadOferta !== 0) {
                        this.producto.cantidadOferta = 0;
                        this.seleccionarColorStock(this.producto);
                        this.producto.aplicarDescuento = this.producto.aplicarDescuentoFicha;
                    }
                    if (this.producto.descuento !== data.descuento) {
                        this.producto.descuento = data.descuento;
                        this.actualizarDescuento(this.producto.descuento * 100);
                    }
                    let toast = this.toastCtrl.create({
                        message: data.motivo,
                        duration: 3000
                    });
                    toast.present();
                }
            },
            error => {
                this.errorMessage = <any>error;
            }
        )
    }

    private seleccionarColorStock(producto: any): void {
        let cantidad: number = producto.cantidad;
        let cantidadOferta: number = producto.cantidadOferta;
        cantidad = +cantidad;
        cantidadOferta = +cantidadOferta;
        
        if (cantidad === 0 && cantidadOferta === 0) {
            producto.colorStock = 'default';
        } else if (producto.cantidadDisponible >= cantidad + cantidadOferta) {
            producto.colorStock = 'secondary';
        } else if (producto.stock >= cantidad + cantidadOferta) {
            producto.colorStock = 'dark';
        } else {
            producto.colorStock = 'danger';
        }
    }

    public actualizarDescuento(descuento: number): void {
        this.producto.descuento = descuento / 100;
        this.descuentoMostrar = descuento + '%';
        this.comprobarCondicionesPrecio();
    }
    
    public seleccionarTexto(evento: any): void {
        evento.target.select();
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

}
