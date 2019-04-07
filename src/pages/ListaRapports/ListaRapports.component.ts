import {Component, ViewChild} from '@angular/core';
import { NavController, AlertController, LoadingController} from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
import { Usuario } from '../../models/Usuario';
import { RapportComponent } from '../Rapport/Rapport.component';
import { Configuracion } from '../../components/configuracion/configuracion';

@Component({
    templateUrl: 'ListaRapports.html',
})
export class ListaRapports extends SelectorBase {
    @ViewChild('clienteInput') myClienteInput;

    private nav: NavController;
    private servicio: ListaRapportsService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    public segmentoRapports: string = 'cliente';
    
    private hoy: Date = new Date();
    public fechaRapports: string = this.hoy.toISOString().slice(0, 10);
    public clienteRapport: string;
    public contactoRapport: string;
    public numeroCliente: string = "";
    public mostrarDirecciones: boolean;

    constructor(servicio: ListaRapportsService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController, private usuario: Usuario) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.clienteRapport = "";
        this.contactoRapport = "0";
    }

    public actualizarCliente(): void {
        if (this.numeroCliente == null || this.numeroCliente.trim() == "") {
            return;
        }
        this.clienteRapport = this.numeroCliente;
    }

    public seleccionarContacto(evento: any): void {
        if (!this.clienteRapport) {
            return;
        }
        this.cargarDatosCliente(this.clienteRapport, evento.contacto);
    }

    public cargarDatos(): void {
        //para que implemente el interface
    }

    public cargarDatosFecha(fecha: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });

        loading.present();

        this.servicio.cargarListaFecha(fecha).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún rapport para listar en esa fecha',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public cargarDatosCliente(cliente: string, contacto: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });

        loading.present();

        this.servicio.cargarListaCliente(cliente, contacto).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún rapport de ese cliente para listar',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }


    public abrirRapport(rapport: any): void {
        this.nav.push(RapportComponent, { rapport: rapport });
    }

    public annadirRapport() {
        let rapport: any = new Object();
        rapport.Id = 0;
        rapport.Fecha = this.fechaRapports;
        rapport.Empresa = Configuracion.EMPRESA_POR_DEFECTO;
        //rapport.Vendedor = this.usuario.vendedor; // tiene que ser el del cliente desde la API
        rapport.Tipo = "V"; // Visita
        rapport.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
        rapport.TipoCentro = 0; // No se sabe
        rapport.Estado = 0; // Vigente
        this.abrirRapport(rapport);
        if (!this.datosFiltrados) {
            this.datosFiltrados = [];
        }
        this.datosFiltrados.push(rapport);
    }

    ionViewDidLoad() {
        setTimeout(() => {
            this.myClienteInput.setFocus();
        }, 150);
    }

    public cambiarSegmento(): void {
        if (this.segmentoRapports == 'fecha') {
            if (this.datosFiltrados == null || this.datosFiltrados.length == 0) {
                this.cargarDatosFecha(this.fechaRapports);
            }
        } else {
            setTimeout(() => {
                this.myClienteInput.setFocus();
            }, 150);
        }
    }
}
