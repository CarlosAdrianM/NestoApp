import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
export declare class ListaRapports extends SelectorBase {
    private nav;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    segmentoRapports: string;
    fechaRapports: string;
    constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController);
    cargarDatos(fecha: string): void;
    abrirRapport(rapport: any): void;
    annadirRapport(): void;
}
