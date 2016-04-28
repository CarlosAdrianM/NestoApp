import {Page, NavController, NavParams} from 'ionic-angular';
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
        this.actualizarDescuento(this.producto.descuento * 100); // aquí se inicializaría con el descuento del cliente * 100
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
        this.servicio.actualizarPrecioProducto(producto, this.cliente).subscribe(
            data => {
                producto.precio = data.precio;
                this.actualizarDescuento(data.descuento*100);
            },
            error => this.errorMessage = <any>error
        );

        this.seleccionarColorStock(producto);
    }

    private seleccionarColorStock(producto: any): void {
        let cantidad: number = producto.cantidad;
        let cantidadOferta: number = producto.cantidadOferta;
        cantidad = +cantidad;
        cantidadOferta = +cantidadOferta;
        
        if (cantidad === 0 && cantidadOferta === 0) {
            producto.colorStock = 'default';
        } else if (producto.cantidadDisponible >= cantidad + producto.cantidadOferta) {
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
    }
    
    public seleccionarTexto(evento: any): void {
        evento.target.select();
    }

    private abrirUltimasVentas(): void {
        this.nav.push(UltimasVentasProductoCliente, { producto: this.producto.producto, cliente: this.cliente });
    }
}
