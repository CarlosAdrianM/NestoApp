import { AlertController, NavController, LoadingController } from 'ionic-angular';
import { SelectorPlazosPagoService } from './SelectorPlazosPago.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorPlazosPago extends SelectorBase {
    seleccionado: any;
    cliente: any;
    private nav;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    constructor(servicio: SelectorPlazosPagoService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController);
    ngOnInit(): void;
    cargarDatos(): void;
}
