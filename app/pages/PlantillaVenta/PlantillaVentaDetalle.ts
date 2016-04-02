import {Page, NavController, NavParams} from 'ionic-angular';
import {PlantillaVentaService} from './PlantillaVenta.service';

@Page({
    templateUrl: 'build/pages/PlantillaVenta/PlantillaVentaDetalle.html',
    providers: [PlantillaVentaService],
})
export class PlantillaVentaDetalle {

    constructor(servicio: PlantillaVentaService, nav: NavController, navParams: NavParams) {
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
    private servicio: PlantillaVentaService;

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
