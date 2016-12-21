import { AlertController, LoadingController } from 'ionic-angular';
import { SelectorFormasPagoService } from './SelectorFormasPago.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorFormasPago extends SelectorBase {
    cliente: any;
    seleccionado: any;
    private alertCtrl;
    private loadingCtrl;
    private servicio;
    constructor(servicio: SelectorFormasPagoService, alertCtrl: AlertController, loadingCtrl: LoadingController);
    ngOnInit(): void;
    cargarDatos(): void;
}
