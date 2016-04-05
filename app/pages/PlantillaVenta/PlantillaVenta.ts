import {Page, NavController} from 'ionic-angular';
import {SelectorClientes} from '../../componentes/SelectorClientes/SelectorClientes';
import {SelectorPlantillaVenta} from '../../componentes/SelectorPlantillaVenta/SelectorPlantillaVenta';

import {PlantillaVentaDetalle} from './PlantillaVentaDetalle';

@Page({
    templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
    directives: [SelectorClientes, SelectorPlantillaVenta],
})
export class PlantillaVenta {
    constructor(nav: NavController) {
        this.opcionesSlides = {
            allowSwipeToNext: false,
            onInit: (slides: any): any => this.slider = slides,
        };
        this.nav = nav;
    }

    private nav: NavController;
    public opcionesSlides: any;
    public slider: any;
    public clienteSeleccionado: any;

    public cargarProductos(cliente: any): void {
        this.clienteSeleccionado = cliente;
        this.slider.unlockSwipeToNext();
        this.slider.slideNext();
    }
}
