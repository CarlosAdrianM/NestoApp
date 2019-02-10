import {Component, Input, ViewChild } from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {SelectorPlantillaVentaService} from './SelectorPlantillaVenta.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';
import { SelectorPlantillaVentaDetalle } from './SelectorPlantillaVentaDetalle';
import { Keyboard } from '@ionic-native/keyboard';

@Component({
    selector: 'selector-plantilla-venta',
    templateUrl: 'SelectorPlantillaVenta.html',
    // inputs: ['cliente'],
})

export class SelectorPlantillaVenta extends SelectorBase {

    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorPlantillaVentaService;
    private nav: NavController;

    @Input() public cliente: any;
    @Input() public almacen: any;

    constructor(servicio: SelectorPlantillaVentaService, alertCtrl: AlertController, loadingCtrl: LoadingController, nav: NavController, private keyboard: Keyboard) {
        super();
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.nav = nav;
    }

    @ViewChild('filtro') myProductoSearchBar;

    /*
    ngAfterViewInit() {
        
    }
    */

    public setFocus(): void {
        setTimeout(() => {
            this.myProductoSearchBar.setFocus();
            this.keyboard.show();
        }, 1500);
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
                    clone.esSobrePedido = clone.estado != 0;
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
                //this.myProductoSearchBar.setFocus();
            },
            () => {
                loading.dismiss();
                this.setFocus();
            }
        );
        //this.myProductoSearchBar.setFocus();
    }

    public abrirDetalle(producto: any, almacen: any): void {
        if (this.agregarDato(producto)) {
            console.log("Agregado dato");
            producto.aplicarDescuentoFicha = producto.aplicarDescuento;
        }
        this.nav.push(SelectorPlantillaVentaDetalle, { producto: producto, cliente: this.cliente, almacen: almacen });
    }

    public cargarResumen(): any[] {
        let productosResumen: any[] = [];
        this.baseImponiblePedido = 0;
        this.baseImponibleParaPortes = 0;
        for (let value of this.datosIniciales()) {
            if (+value.cantidad !== 0 || +value.cantidadOferta !== 0) {
                productosResumen.push(value);
                console.log("Nº elementos en resumen: " + productosResumen.length);
                value.esSobrePedido = !(value.estado == 0 ||(value.stockActualizado && value.cantidadDisponible >= +value.cantidad + value.cantidadOferta));
                if(!value.stockActualizado) {
                    value.colorSobrePedido = 'default';
                } else if (value.esSobrePedido) {
                    value.colorSobrePedido = 'danger';
                } else {
                    value.colorSobrePedido = 'none';
                }
                this.baseImponiblePedido += value.cantidad * value.precio * (1 - value.descuento);
                if (!value.esSobrePedido) {
                    this.baseImponibleParaPortes += value.cantidad * value.precio * (1 - value.descuento);
                }

            }
        }
        console.log("Productos resumen: " +  productosResumen.toString());
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

    private _baseImponibleParaPortes: number = 0;
    get baseImponibleParaPortes(): number {
        return this._baseImponibleParaPortes;
    }
    set baseImponibleParaPortes(value: number) {
        this._baseImponibleParaPortes = value;
    }
}
