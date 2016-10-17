import {Component, Injectable, Input} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';
import {SelectorPlantillaVentaDetalle} from './SelectorPlantillaVentaDetalle';

@Component({
    selector: 'selector-plantilla-venta',
    templateUrl: 'SelectorPlantillaVenta.html',
    // inputs: ['cliente'],
})

@Injectable()
export class SelectorPlantillaVenta extends SelectorBase {

    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorPlantillaVentaService;
    private nav: NavController;

    @Input() public cliente: any;

    constructor(servicio: SelectorPlantillaVentaService, alertCtrl: AlertController, loadingCtrl: LoadingController, nav: NavController) {
        super();
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.nav = nav;
    }

    public cargarDatos(cliente: any): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Productos...',
        });

        loading.present();

        this.servicio.getProductos(cliente).subscribe(
            data => {
                data = data.map(function (item): any {
                    let clone: any = Object.assign({}, item); // Objects are pass by referenced, hence, you need to clone object
                    clone.aplicarDescuentoFicha = clone.aplicarDescuento;
                    return clone;
                });
                this.inicializarDatos(data);
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Este cliente no tiene histórico de compras',
                        buttons: ['Ok'],
                    });
                    alert.present();
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
        if (this.agregarDato(producto)) {
            producto.aplicarDescuentoFicha = producto.aplicarDescuento;
        }
        this.nav.push(SelectorPlantillaVentaDetalle, { producto: producto, cliente: this.cliente });
    }

    public cargarResumen(): any[] {
        let productosResumen: any[] = [];
        this.baseImponiblePedido = 0;
        for (let value of this.datosIniciales()) {
            if (+value.cantidad !== 0 || +value.cantidadOferta !== 0) {
                productosResumen.push(value);
                this.baseImponiblePedido += value.cantidad * value.precio * (1 - value.descuento);
            }
        }
        return productosResumen;
    }

    public ngOnChanges(changes): void {
        this.cargarDatos(this.cliente);
    }

    public buscarEnTodosLosProductos(filtro: any): void {
        this.servicio.buscarProductos(filtro).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay productos que coincidan con ' + filtro,
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatosFiltrados(data);
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    get totalPedido(): number {
        // Hay que calcularlo bien
        return this._baseImponiblePedido * 1.21;
    }

    private _baseImponiblePedido: number = 0;
    get baseImponiblePedido(): number {
        return this._baseImponiblePedido;
    }
    set baseImponiblePedido(value: number) {
        this._baseImponiblePedido = value;
    }

}
