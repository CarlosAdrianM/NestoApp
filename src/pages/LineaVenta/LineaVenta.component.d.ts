import { NavParams, NavController, AlertController } from 'ionic-angular';
import { LineaVenta } from './LineaVenta';
import { LineaVentaService } from './LineaVenta.service';
export declare class LineaVentaComponent {
    private servicio;
    private alertCtrl;
    private nav;
    linea: LineaVenta;
    errorMessage: string;
    private descuentoCadena;
    constructor(navParams: NavParams, servicio: LineaVentaService, alertCtrl: AlertController, nav: NavController);
    submitted: boolean;
    onSubmit(): void;
    actualizarDescuento(dto: any): void;
    cambiarProducto(evento: any): void;
    abrirProducto(): void;
    seleccionarTexto(evento: any): void;
}
