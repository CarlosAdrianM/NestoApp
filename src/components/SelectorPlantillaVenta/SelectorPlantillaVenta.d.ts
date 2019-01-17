import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
import { Keyboard } from '@ionic-native/keyboard';
export declare class SelectorPlantillaVenta extends SelectorBase {
    private keyboard;
    private alertCtrl;
    private loadingCtrl;
    private servicio;
    private nav;
    cliente: any;
    constructor(servicio: SelectorPlantillaVentaService, alertCtrl: AlertController, loadingCtrl: LoadingController, nav: NavController, keyboard: Keyboard);
    myProductoSearchBar: any;
    setFocus(): void;
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
