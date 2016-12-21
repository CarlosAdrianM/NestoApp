import { AlertController } from 'ionic-angular';
import { SelectorDireccionesEntregaService } from './SelectorDireccionesEntrega.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorDireccionesEntrega extends SelectorBase {
    private servicio;
    private alertCtrl;
    direccionesEntrega: any[];
    direccionSeleccionada: any;
    cliente: any;
    seleccionado: string;
    constructor(servicio: SelectorDireccionesEntregaService, alertCtrl: AlertController);
    cargarDatos(cliente: any): void;
    seleccionarDireccion(direccion: any): void;
    ngOnChanges(changes: any): void;
}
