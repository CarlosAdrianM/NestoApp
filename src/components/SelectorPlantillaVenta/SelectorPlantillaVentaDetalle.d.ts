import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { SelectorPlantillaVentaService } from './SelectorPlantillaVenta.service';
import { Keyboard } from '@ionic-native/keyboard';
export declare class SelectorPlantillaVentaDetalle {
    private keyboard;
    constructor(servicio: SelectorPlantillaVentaService, nav: NavController, navParams: NavParams, alertCtrl: AlertController, toastCtrl: ToastController, keyboard: Keyboard);
    myTxtCantidad: any;
    ngAfterViewInit(): void;
    setFocus(): void;
    private errorMessage;
    private nav;
    private navParams;
    producto: any;
    private cliente;
    private servicio;
    descuentoMostrar: string;
    private alertCtrl;
    private toastCtrl;
    private comprobarSiExisteElProducto;
    actualizarCantidad(producto: any): void;
    actualizarPrecio(): void;
    private seleccionarColorStock;
    actualizarDescuento(descuento: number): void;
    seleccionarTexto(evento: any): void;
    abrirUltimasVentas(): void;
    sePuedeHacerDescuento(producto: any): boolean;
    mostrarStock(producto: any): void;
    abrirProducto(): void;
}
