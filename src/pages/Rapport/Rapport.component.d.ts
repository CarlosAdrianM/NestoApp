import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';
export declare class RapportComponent {
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    rapport: any;
    errorMessage: string;
    constructor(navParams: NavParams, servicio: RapportService, alertCtrl: AlertController, loadingCtrl: LoadingController);
    submitted: boolean;
    onSubmit(): void;
    seleccionarTexto(evento: any): void;
    modificarRapport(): void;
}
