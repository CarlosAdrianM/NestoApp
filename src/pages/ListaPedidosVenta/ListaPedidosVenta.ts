// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes

// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
import {Component} from '@angular/core';
import { NavController, AlertController, LoadingController} from 'ionic-angular';
import {ListaPedidosVentaService} from './ListaPedidosVenta.service';
import {PedidoVentaComponent} from '../PedidoVenta/PedidoVenta.component';
import {SelectorBase} from '../../components/SelectorBase/SelectorBase';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FileOpener } from '@ionic-native/file-opener';

registerLocaleData(localeEs);

@Component({
    templateUrl: 'ListaPedidosVenta.html',
})
export class ListaPedidosVenta extends SelectorBase {
    // private listaPedidos: any[];
    private nav: NavController;
    private servicio: ListaPedidosVentaService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private _estaFiltradoPendientes: boolean;
    get estaFiltradoPendientes(): boolean {
        return this._estaFiltradoPendientes;
    }
    set estaFiltradoPendientes(value: boolean) {
        if (this._estaFiltradoPendientes != value) {
            this._estaFiltradoPendientes = value;
            if (value && this.estaFiltradoPresupuestos) {
                this.estaFiltradoPresupuestos = false;
            }
            if (value) {
                this.datosFiltrados = this.datosFiltrados.filter((e)=> e.tienePendientes);
            } else {
                this.datosFiltrados = this.datosIniciales();
                this._estaFiltradoPicking = false;
            }    
        }        
    }
    private _estaFiltradoPicking: boolean;
    get estaFiltradoPicking(): boolean {
        return this._estaFiltradoPicking;
    }
    set estaFiltradoPicking(value: boolean) {
        if (this._estaFiltradoPicking != value) {
            this._estaFiltradoPicking = value;
            if (value && this.estaFiltradoPresupuestos) {
                this.estaFiltradoPresupuestos = false;
            }
            if (value) {
                this.datosFiltrados = this.datosFiltrados.filter((e)=> e.tienePicking);
            } else {
                this.datosFiltrados = this.datosIniciales();
                this._estaFiltradoPendientes = false;
            }    
        }   
    }
    private _estaFiltradoPresupuestos: boolean;
    get estaFiltradoPresupuestos(): boolean {
        return this._estaFiltradoPresupuestos;
    }
    set estaFiltradoPresupuestos(value: boolean) {
        if (value != this._estaFiltradoPresupuestos) {
            if (value && this.estaFiltradoPendientes) {
                this.estaFiltradoPendientes = false;
            }
            if (value && this.estaFiltradoPicking) {
                this.estaFiltradoPicking = false;
            }
            this._estaFiltradoPresupuestos = value;
            this.cargarDatos();    
        }
    }

    constructor(servicio: ListaPedidosVentaService, nav: NavController, alertCtrl: AlertController, 
        loadingCtrl: LoadingController, private fileOpener: FileOpener) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarDatos();
    }

    public abrirPedido(pedido: any): void {
        this.nav.push(PedidoVentaComponent, { empresa: pedido.empresa, numero: pedido.numero });
    }

    public abrirPedidoNumero(numeroPedido: number): void {
        this.nav.push(PedidoVentaComponent, { empresa: "1", numero: numeroPedido });
    }

    public cargarDatos(): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Pedidos...',
        });

        loading.present();

        this.servicio.cargarLista(this.estaFiltradoPresupuestos).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún pedido pendiente de servir',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
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

    public mostrarFiltros() {
        let alert = this.alertCtrl.create();
        alert.setTitle('Seleccione los filtros');

        alert.addInput({
            type: 'checkbox',
            label: 'Presupuestos',
            value: 'presupuestos',
            checked: this.estaFiltradoPresupuestos,
            handler: data => { this.estaFiltradoPresupuestos = data.checked}
        });

        alert.addInput({
        type: 'checkbox',
        label: 'Pendientes',
        value: 'pendientes',
        checked: this.estaFiltradoPendientes,
        handler: data => { this.estaFiltradoPendientes = data.checked}
        });

        alert.addInput({
        type: 'checkbox',
        label: 'Picking',
        value: 'picking',
        checked: this.estaFiltradoPicking,
        handler: data => { this.estaFiltradoPicking = data.checked}
        });

        alert.addButton('OK');
        
        alert.present();
    }

    public descargarPedido(event: Event, pedido: any): void {
        event.stopPropagation();
        let loading: any = this.loadingCtrl.create({
            content: 'Generando PDF pedido...',
        });

        loading.present();

        this.servicio.descargarPedido(pedido.empresa, pedido.numero).then(
            entry => {
                let alert = this.alertCtrl.create({
                    title: 'PDF generado',
                    subTitle: "Pedido descargado: \n"+entry.toURL(),
                    buttons: ['Ok'],
                });
                alert.present();
                loading.dismiss();
                this.fileOpener.open(entry.toURL(), 'application/pdf');
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            }
        );
    }
}
