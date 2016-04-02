import {Page, NavController} from 'ionic-angular';
import {SelectorClientes} from '../../componentes/SelectorClientes/SelectorClientes';
import {PlantillaVentaService} from './PlantillaVenta.service';
import {PlantillaVentaDetalle} from './PlantillaVentaDetalle';

@Page({
    templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
    directives: [SelectorClientes],
    providers: [PlantillaVentaService],
})
export class PlantillaVenta {
    constructor(servicio: PlantillaVentaService, nav: NavController) {
        this.opcionesSlides = {
            allowSwipeToNext: false,
            onInit: (slides: any): any => this.slider = slides,
        };
        this.servicio = servicio;
        this.nav = nav;
    }

    private cliente: any;
    private errorMessage: string;
    private nav: NavController;
    public opcionesSlides: any;
    private productos: any[];
    private productoInicial: any[];
    public slider: any;
    private servicio: PlantillaVentaService;

    public cargarProductos(cliente: any): void {
        this.servicio.getProductos(cliente).subscribe(
            data => {
                this.productos = data;
                this.productoInicial = data;
                console.log(this.productos);
            },
            error => this.errorMessage = <any>error
        );
        this.cliente = cliente;
        this.slider.unlockSwipeToNext();
        this.slider.slideNext();
    }

    public abrirDetalle(producto: any): void {
        console.log(producto);
        this.nav.push(PlantillaVentaDetalle, { producto: producto });
    }
}
