import {Component, Injectable, Input} from 'angular2/core';
import {Searchbar, List, Item, Alert, NavController} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';
import {SelectorPlantillaVentaDetalle} from './SelectorPlantillaVentaDetalle'

@Component({
    selector: 'selector-plantilla-venta',
    templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVenta.html',
    directives: [Searchbar, List, Item],
    providers: [SelectorPlantillaVentaService],
    inputs: ['cliente'],
})

@Injectable()
export class SelectorPlantillaVenta extends SelectorBase {
    private errorMessage: string;
    private servicio: SelectorPlantillaVentaService;
    private nav: NavController;

    @Input()
    cliente: any;

    constructor(servicio: SelectorPlantillaVentaService, nav: NavController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
    }

    public cargarDatos(cliente: any): void {
        this.servicio.getProductos(cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'Este cliente no tiene histórico de compras',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => this.errorMessage = <any>error
        );
        /*
        this.cliente = cliente;
        this.slider.unlockSwipeToNext();
        this.slider.slideNext();
        */
    }
    
    public abrirDetalle(producto: any): void {
        console.log(producto);
        this.nav.push(SelectorPlantillaVentaDetalle, { producto: producto });
    }

    public seleccionarProducto(producto: any): void {
        this.seleccionar.emit(producto);
    }

    ngOnChanges() {
        this.cargarDatos(this.cliente);
    }
}
