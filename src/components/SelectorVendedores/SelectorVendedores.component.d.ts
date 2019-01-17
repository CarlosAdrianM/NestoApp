import { AlertController, NavController, LoadingController } from 'ionic-angular';
import { SelectorVendedoresService } from './SelectorVendedores.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorVendedoresComponent extends SelectorBase {
    seleccionado: any;
    etiqueta: any;
    private nav;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    constructor(servicio: SelectorVendedoresService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController);
    ngOnInit(): void;
    cargarDatos(): void;
}
