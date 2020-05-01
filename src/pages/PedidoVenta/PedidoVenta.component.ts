import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import {PedidoVentaService} from './PedidoVenta.service';
import {LineaVentaComponent} from '../LineaVenta/LineaVenta.component';
import {LineaVenta} from '../LineaVenta/LineaVenta';
import { PedidoVenta } from './PedidoVenta';
import {Configuracion} from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';
import { dateDataSortValue } from 'ionic-angular/umd/util/datetime-util';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';


@Component({
    templateUrl: 'PedidoVenta.html',
})

export class PedidoVentaComponent {

    public hoy: Date = new Date();
    private iva: string;
    private nav: NavController;
    public pedido: PedidoVenta;
    public segmentoPedido: string = 'cabecera';
    private servicio: PedidoVentaService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private _fechaEntrega: string;
    get fechaEntrega() {
        return this._fechaEntrega;
    }
    set fechaEntrega(value: string) {
        if (this._fechaEntrega) {
            this.pedido.LineasPedido.forEach(l => {
                if (l.picking == 0 && (l.estado == -1 || l.estado == 1)) {
                    l.fechaEntrega = new Date(value)
                }
            });
        }
        this._fechaEntrega = value;
    }

        
    constructor(servicio: PedidoVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, loadingCtrl: LoadingController, private usuario: Usuario) {
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
                this.pedido = data as PedidoVenta;
                for (let i = 0; i < this.pedido.LineasPedido.length; i++) {
                    this.pedido.LineasPedido[i] = new LineaVenta(this.pedido.LineasPedido[i]);
                }
                this.iva = this.pedido.iva;
                this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
                this.pedido.vendedor = this.pedido.vendedor.trim(); // Cambiar en la API
                if (this.pedido.LineasPedido && this.pedido.LineasPedido.length > 0) {
                    this.fechaEntrega = this.pedido.LineasPedido[0].fechaEntrega.toString();
                }
                
                /*
                var fechaPedidoConUsoHorario: Date = new Date(this.pedido.fecha);
                var fechaPedido: Date = new Date(fechaPedidoConUsoHorario.getTime() - fechaPedidoConUsoHorario.getTimezoneOffset()*60000);
                this.pedido.fecha = new Date(fechaPedido.getFullYear(), fechaPedido.getMonth(), fechaPedido.getDate()).toISOString();
                */
            },
            error => {
                let textoError = 'No se ha podido cargar el pedido de la empresa ' + empresa + ".\n" + error.ExceptionMessage;
                let innerException = error.InnerException;
                while (innerException != null) {
                  textoError += '\n' + innerException.ExceptionMessage;
                  innerException = innerException.InnerException;
                }
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: textoError,
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

    public abrirLinea(linea: LineaVenta) {
        console.log(linea);
        this.nav.push(LineaVentaComponent, {linea: linea});
    }

    public annadirLinea() {
        let linea: LineaVenta = new LineaVenta();
        linea.copiarDatosPedido(this.pedido);
        linea.usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
        this.abrirLinea(linea);
        this.pedido.LineasPedido = this.pedido.LineasPedido.concat(linea);
    }

    public borrarLinea(linea: LineaVenta) {
        let confirm = this.alertCtrl.create({
            title: 'Confirmar',
            message: '¿Desea borrar la línea?',
            buttons: [
                {
                    text: 'Sí',
                    handler: () => {
                        this.pedido.LineasPedido = this.pedido.LineasPedido.filter(obj => obj !== linea);
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
                                this.cargarPedido(this.pedido.empresa, this.pedido.numero);
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
                              let textoError = 'No se ha podido modificar el pedido.\n' + error.ExceptionMessage;
                                let innerException = error.InnerException;
                                while (innerException != null) {
                                  textoError += '\n' + innerException.ExceptionMessage;
                                  innerException = innerException.InnerException;
                                }
                                let alert = this.alertCtrl.create({
                                    title: 'Error',
                                    subTitle: textoError,
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                            },
                            () => {
                                //loading.dismiss();
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
