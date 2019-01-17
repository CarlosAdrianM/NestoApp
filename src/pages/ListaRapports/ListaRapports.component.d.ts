import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
import { Usuario } from '../../models/Usuario';
export declare class ListaRapports extends SelectorBase {
    private usuario;
    myClienteInput: any;
    private nav;
    private servicio;
    private alertCtrl;
    private loadingCtrl;
    segmentoRapports: string;
    private hoy;
    fechaRapports: string;
    clienteRapport: string;
    contactoRapport: string;
    numeroCliente: string;
    mostrarDirecciones: boolean;
    constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController, usuario: Usuario);
    actualizarCliente(): void;
    seleccionarContacto(evento: any): void;
    cargarDatos(): void;
    cargarDatosFecha(fecha: string): void;
    cargarDatosCliente(cliente: string, contacto: string): void;
    abrirRapport(rapport: any): void;
    annadirRapport(): void;
    ionViewDidLoad(): void;
    cambiarSegmento(): void;
}
