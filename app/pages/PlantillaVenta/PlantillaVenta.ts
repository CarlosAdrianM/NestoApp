import {Page, NavController, Alert} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {SelectorClientes} from '../../componentes/SelectorClientes/SelectorClientes';
import {SelectorPlantillaVenta} from '../../componentes/SelectorPlantillaVenta/SelectorPlantillaVenta';
import {SelectorDireccionesEntrega} from '../../componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega';

@Page({
    templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
    directives: [SelectorClientes, SelectorPlantillaVenta, SelectorDireccionesEntrega],
})
export class PlantillaVenta {
    constructor(nav: NavController) {
        this.opcionesSlides = {
            allowSwipeToNext: false,
            paginationHide: false,
            onInit: (slides: any): any => this.slider = slides,
            onSlideChangeStart: (slides: any): void => this.avanzar(slides),
        };
        this.nav = nav;
    }

    private nav: NavController;
    public opcionesSlides: any;
    public slider: any;
    public clienteSeleccionado: any;
    private productosResumen: any[];
    public direccionEntrega: any;
    private fechaEntrega: Date = new Date();

    @ViewChild(SelectorPlantillaVenta)
    private _selectorPlantillaVenta: SelectorPlantillaVenta;

    public cargarProductos(cliente: any): void {
        if (!this.clienteSeleccionado) {
            this.cargarProductosPlantilla(cliente);
        } else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
            let alert: any = Alert.create({
                title: 'Cambiar cliente',
                message: '¿Desea cambiar de cliente y comenzar el pedido de nuevo?',
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: (): any => {
                            return;
                        },
                    },
                    {
                        text: 'Sí',
                        handler: (): any => {
                            this.cargarProductosPlantilla(cliente);
                        },
                    },
                ],
            });
            this.nav.present(alert);
        } else if (this.clienteSeleccionado === cliente) {
            this.slider.slideNext();
        }
    }

    private cargarProductosPlantilla(cliente: any[]): void {
        this.clienteSeleccionado = cliente;
        this.slider.unlockSwipeToNext();
        this.slider.slideNext();
    }

    /*
    public cargarResumen(productosResumen: any[]): void {
        this.productosResumen = productosResumen;
    }
    */
    public avanzar(slides: any): void {
        if (slides.activeIndex === 2 && slides.previousIndex === 1) {
            this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
        }/* else if (slides.activeIndex === 3 && slides.previousIndex === 2) {
            
        }*/
    }

    public seleccionarCliente(cliente: any): void {
        this.direccionEntrega = cliente;
    }

    public prueba(): void {
        console.log(this.fechaEntrega);
    }

}
