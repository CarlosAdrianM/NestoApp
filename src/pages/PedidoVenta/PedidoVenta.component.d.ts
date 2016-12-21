import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { PedidoVentaService } from './PedidoVenta.service';
import { LineaVenta } from '../LineaVenta/LineaVenta';
import { PedidoVenta } from './PedidoVenta';
export declare class PedidoVentaComponent {
    hoy: Date;
    private iva;
    private nav;
    pedido: PedidoVenta;
    segmentoPedido: string;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    constructor(servicio: PedidoVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, loadingCtrl: LoadingController);
    cargarPedido(empresa: string, numero: number): void;
    seleccionarFormaPago(evento: any): void;
    cambiarIVA(): void;
    abrirLinea(linea: LineaVenta): void;
    annadirLinea(): void;
    modificarPedido(): void;
    cadenaFecha(cadena: string): Date;
}
