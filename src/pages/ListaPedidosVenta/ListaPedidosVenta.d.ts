import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaPedidosVentaService } from './ListaPedidosVenta.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
export declare class ListaPedidosVenta extends SelectorBase {
    private nav;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    constructor(servicio: ListaPedidosVentaService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController);
    abrirPedido(pedido: any): void;
    abrirPedidoNumero(numeroPedido: number): void;
    cargarDatos(nada: string): void;
}
