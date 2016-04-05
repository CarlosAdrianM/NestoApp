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
                if (producto.cantidadDisponible >= producto.cantidad + producto.cantidadOferta) {
                    producto.colorStock = 'Verde';
                } else if (producto.stock >= producto.cantidad + producto.cantidadOferta) {
                    producto.colorStock = 'Naranja';
                } else {
                    producto.colorStock = 'Rojo';
                }
            },
            error => this.errorMessage = <any>error
        );
    }
}
