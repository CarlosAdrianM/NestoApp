import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
export declare class SelectorPlantillaVentaDetalle {
    constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, toastCtrl: ToastController);
    private errorMessage;
    private nav;
    private navParams;
    producto: any;
    private cliente;
    private servicio;
    descuentoMostrar: string;
    private alertCtrl;
    private toastCtrl;
    private comprobarSiExisteElProducto(producto);
    actualizarCantidad(producto: any): void;
    actualizarPrecio(): void;
    private comprobarCondicionesPrecio();
    private seleccionarColorStock(producto);
    actualizarDescuento(descuento: number): void;
    seleccionarTexto(evento: any): void;
    abrirUltimasVentas(): void;
    sePuedeHacerDescuento(producto: any): boolean;
    mostrarStock(producto: any): void;
}
