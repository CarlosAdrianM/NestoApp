import {Page, NavController, NavParams} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';

@Page({
    templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle.html',
    providers: [SelectorPlantillaVentaService],
})
export class SelectorPlantillaVentaDetalle {

    constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.servicio = servicio;
        if (!this.producto.stockActualizado) {
            this.comprobarSiExisteElProducto(this.producto);
        }
    }

    private errorMessage: string;
    private nav: NavController;
    private navParams: NavParams;
    private producto: any;
    private servicio: SelectorPlantillaVentaService;

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

    private seleccionarColorStock(producto: any): void {
        if (producto.cantidadDisponible >= producto.cantidad + producto.cantidadOferta) {
            producto.colorStock = 'secondary';
        } else if (producto.stock >= producto.cantidad + producto.cantidadOferta) {
            producto.colorStock = 'primary';
        } else {
            producto.colorStock = 'danger';
        }
    }

    public seleccionarTexto(evento: any): void {
        evento.target.select();
    }

}
