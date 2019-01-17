import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesDetalleService } from './ComisionesDetalle.service';
export declare class ComisionesDetalleComponent {
    private servicio;
    private nav;
    private navParams;
    alertCtrl: AlertController;
    loadingCtrl: LoadingController;
    listaDetalleComision: any;
    constructor(servicio: ComisionesDetalleService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, loadingCtrl: LoadingController);
    private cargarDetalle;
    abrirPedido(detalle: any): void;
}
