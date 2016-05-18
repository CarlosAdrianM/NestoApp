import {Page, NavController, NavParams, Alert, Toast} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import { UltimasVentasProductoCliente } from '../../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';

@Page({
    templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle.html',
    providers: [SelectorPlantillaVentaService],
})
export class SelectorPlantillaVentaDetalle {

    constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.cliente = navParams.get('cliente');
        this.servicio = servicio;
        if (!this.producto.stockActualizado) {
            this.comprobarSiExisteElProducto(this.producto);
        }
        // this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
        if (this.producto.cantidad === 0 && this.producto.cantidadOferta === 0) {
            this.actualizarCantidad(this.producto);
        } 
        this.actualizarDescuento(this.producto.descuento * 100);

    }

    private errorMessage: string;
    private nav: NavController;
    private navParams: NavParams;
    private producto: any;
    private cliente: any;
    private servicio: SelectorPlantillaVentaService;
    private descuentoMostrar: string;

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

    private actualizarCantidad(producto: any): void {
        if (producto.cantidadOferta > 0) {
            producto.aplicarDescuento = false;
        } else {
            producto.aplicarDescuento = producto.aplicarDescuentoFicha;
        }

        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(
            data => {
                if (producto.precio !== data.precio) {
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

    private actualizarPrecio(): void {
        // Esto lo hacemos porque guarda el precio como string y da error
        this.producto.precio = +this.producto.precio;
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
                    }
                    if (this.producto.aplicarDescuento !== data.aplicarDescuento) {
                        this.producto.aplicarDescuento = data.aplicarDescuento;
                    }
                    if (this.producto.cantidadOferta !== 0) {
                        this.producto.cantidadOferta = 0;
                        this.producto.aplicarDescuento = this.producto.aplicarDescuentoFicha;
                    }
                    if (this.producto.descuento !== data.descuento) {
                        this.producto.descuento = data.descuento;
                        this.actualizarDescuento(this.producto.descuento * 100);
                    }
                    let toast = Toast.create({
                        message: data.motivo,
                        duration: 3000
                    });
                    this.nav.present(toast);
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

    private actualizarDescuento(descuento: number): void {
        this.producto.descuento = descuento / 100;
        this.descuentoMostrar = descuento + '%';
        this.comprobarCondicionesPrecio();
    }
    
    public seleccionarTexto(evento: any): void {
        evento.target.select();
    }

    private abrirUltimasVentas(): void {
        this.nav.push(UltimasVentasProductoCliente, { producto: this.producto.producto, cliente: this.cliente });
    }

    private sePuedeHacerDescuento(producto: any): boolean {
        return (producto.cantidadOferta === 0 || producto.cantidadOferta === "0") && producto.aplicarDescuento && producto.subGrupo.toLowerCase() !== 'otros aparatos';
    }

}
