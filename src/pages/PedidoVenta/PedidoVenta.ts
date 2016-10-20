import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
//import { Parametros } from '../../services/Parametros.service';
import {PedidoVentaService} from './PedidoVenta.service';
//import { SelectorFormasPago } from '../../components/SelectorFormasPago/SelectorFormasPago';
//import { SelectorPlazosPago } from '../../components/SelectorPlazosPago/SelectorPlazosPago';
//import {SelectorDireccionesEntrega} from '../../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega';

@Component({
    templateUrl: 'PedidoVenta.html',
})
export class PedidoVenta {

    public hoy: Date = new Date();
    private iva: string;
    private nav: NavController;
    public pedido: any;
    public segmentoPedido: string = 'cabecera';
    private servicio: PedidoVentaService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    
    constructor(servicio: PedidoVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, loadingCtrl: LoadingController) {
        this.nav = nav;
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarPedido(navParams.get('empresa'), navParams.get('numero'));
    }

    public cargarPedido(empresa: string, numero: number): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Pedido...',
        });

        loading.present();

        this.servicio.cargarPedido(empresa, numero).subscribe(
            data => {
                this.pedido = data;
                //this.pedido.fechaMostrar = new Date(this.pedido.fecha);
                //this.pedido.primerVencimientoMostrar = new Date(this.pedido.primerVencimiento);
                this.iva = this.pedido.iva;
                this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
            },
            error => {
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se ha podido cargar el pedido de la empresa ' + empresa,
                    buttons: ['Ok'],
                });
                alert.present();
                loading.dismiss();
            },
            () => {
                loading.dismiss();
            }
        );
    }
    
    public seleccionarFormaPago(evento: any): void {
        this.pedido.formaPago = evento;
    }

    public cambiarIVA(): void {
        this.pedido.iva = this.pedido.iva ? undefined : this.iva;
    }

    public annadirLinea() {
        let alert = this.alertCtrl.create({
            title: 'Añadir Líneas',
            subTitle: 'Parte de la aplicación no implementada aún. En próximas versiones se permitirá ampliar pedidos.',
            buttons: ['Ok'],
        });
        alert.present();
    }

    public modificarPedido(): void {

        let confirm = this.alertCtrl.create({
            title: 'Confirmar',
            message: '¿Está seguro que quiere modificar el pedido?',
            buttons: [
                {
                    text: 'Sí',
                    handler: () => {
                        // Hay que guardar el pedido original en alguna parte
                        let loading: any = this.loadingCtrl.create({
                            content: 'Modificando Pedido...',
                        });

                        loading.present();

                        this.servicio.modificarPedido(this.pedido).subscribe(
                            data => {
                                let alert = this.alertCtrl.create({
                                    title: 'Modificado',
                                    subTitle: 'Pedido modificado correctamente',
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                                // this.reinicializar();
                            },
                            error => {
                                let alert = this.alertCtrl.create({
                                    title: 'Error',
                                    subTitle: 'No se ha podido modificar el pedido',
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                            },
                            () => {
                                loading.dismiss();
                            }
                        );
                    }
                },
                {
                    text: 'No',
                    handler: () => {
                        return;
                    }
                }

            ]
        });

        confirm.present();

        
    }


    public cadenaFecha(cadena: string): Date {
        return new Date(cadena);
    }

}
