import {Component, Injectable, Input} from 'angular2/core';
import {Searchbar, List, Item, Button, Alert, NavController, Loading, Toggle, Content} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';
import {SelectorPlantillaVentaDetalle} from './SelectorPlantillaVentaDetalle';

@Component({
    selector: 'selector-plantilla-venta',
    templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVenta.html',
    directives: [Searchbar, List, Item, Button, Toggle, Content],
    providers: [SelectorPlantillaVentaService],
    inputs: ['cliente'],
})

@Injectable()
export class SelectorPlantillaVenta extends SelectorBase {
    private errorMessage: string;
    private servicio: SelectorPlantillaVentaService;
    private nav: NavController;

    @Input() private cliente: any;

    constructor(servicio: SelectorPlantillaVentaService, nav: NavController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
    }

    public cargarDatos(cliente: any): void {
        let loading: any = Loading.create({
            content: 'Cargando Productos...',
        });

        this.nav.present(loading);

        this.servicio.getProductos(cliente).subscribe(
            data => {
                this.inicializarDatos(data);
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'Este cliente no tiene histórico de compras',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public abrirDetalle(producto: any): void {
        this.agregarDato(producto);
        this.nav.push(SelectorPlantillaVentaDetalle, { producto: producto, cliente: this.cliente });
    }

    public cargarResumen(): any[] {
        let productosResumen: any[] = [];
        for (let value of this.datosIniciales()) {
            if (value.cantidad !== 0 || value.cantidadOferta !== 0) {
                productosResumen.push(value);
            }
        }
        return productosResumen;
    }

    public ngOnChanges(): void {
        this.cargarDatos(this.cliente);
    }

    public buscarEnTodosLosProductos(filtro: any): void {
        this.servicio.buscarProductos(filtro).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'No hay productos que coincidan con ' + filtro,
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    this.inicializarDatosFiltrados(data);
                }
            },
            error => this.errorMessage = <any>error
        );
    }
}
