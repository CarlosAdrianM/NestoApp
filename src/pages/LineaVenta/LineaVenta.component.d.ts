import { NavParams, AlertController } from 'ionic-angular';
import { LineaVenta } from './LineaVenta';
import { LineaVentaService } from './LineaVenta.service';
export declare class LineaVentaComponent {
    private servicio;
    private alertCtrl;
    linea: LineaVenta;
    errorMessage: string;
    private descuentoNumero;
    private descuentoCadena;
    constructor(navParams: NavParams, servicio: LineaVentaService, alertCtrl: AlertController);
    submitted: boolean;
    onSubmit(): void;
    actualizarDescuento(dto: number): void;
    cambiarProducto(evento: any): void;
}
