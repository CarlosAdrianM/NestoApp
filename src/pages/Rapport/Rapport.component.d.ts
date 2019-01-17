import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';
import { Usuario } from '../../models/Usuario';
export declare class RapportComponent {
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    private usuario;
    rapport: any;
    errorMessage: string;
    numeroCliente: string;
    modificando: boolean;
    constructor(navParams: NavParams, servicio: RapportService, alertCtrl: AlertController, loadingCtrl: LoadingController, usuario: Usuario);
    submitted: boolean;
    onSubmit(): void;
    leerCliente(cliente: string, contacto: string): void;
    leerClientePrincipal(): void;
    modificarRapport(): void;
    seleccionarContacto(evento: any): void;
    seleccionarTexto(evento: any): void;
    sePuedeModificar(): boolean;
}
