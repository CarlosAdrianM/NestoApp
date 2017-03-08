import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorPlantillaVenta extends SelectorBase {
    private alertCtrl;
    private loadingCtrl;
    private servicio;
    private nav;
    cliente: any;
    constructor(servicio: SelectorPlantillaVentaService, alertCtrl: AlertController, loadingCtrl: LoadingController, nav: NavController);
    cargarDatos(cliente: any): void;
    abrirDetalle(producto: any): void;
    cargarResumen(): any[];
    ngOnChanges(changes: any): void;
    buscarEnTodosLosProductos(filtro: any): void;
    readonly totalPedido: number;
    private _baseImponiblePedido;
    baseImponiblePedido: number;
    private _baseImponibleParaPortes;
    baseImponibleParaPortes: number;
}
