import { Component, ViewChild } from '@angular/core';
import { NavParams, AlertController, LoadingController, Events } from 'ionic-angular';
import { RapportService } from './Rapport.service';
import { Usuario } from '../../models/Usuario';
import { Configuracion } from '../../components/configuracion/configuracion';



@Component({
    templateUrl: 'Rapport.html',
})
export class RapportComponent {

    public rapport: any;
    public errorMessage: string;
    public numeroCliente: string;
    modificando: boolean = false;

    constructor(navParams: NavParams, private servicio: RapportService, private alertCtrl: AlertController, 
        private loadingCtrl: LoadingController, private usuario: Usuario, public events: Events) {
        this.rapport = navParams.get('rapport');
        this.numeroCliente = this.rapport.Cliente;
        /*
        // Esto debería hacerlo la API directamente
        if (this.rapport && this.rapport.Tipo) {
            this.rapport.Tipo = this.rapport.Tipo.trim();
        }
        */
    }

    submitted = false;
    onSubmit() { this.submitted = true; }
    
    @ViewChild('cliente') inputCliente;
    ngAfterViewInit() {
        setTimeout(()=>{
            this.inputCliente.setFocus();
        },500)
    }

    public leerCliente(cliente: string, contacto: string): void {
        this.servicio.getCliente(cliente, contacto).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No se puede cargar el cliente ' + this.rapport.Cliente,
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.rapport.Cliente = data.cliente;
                    this.rapport.Contacto = data.contacto;
                    this.rapport.Direccion = data.direccion;
                    this.rapport.Nombre = data.nombre;
                    this.rapport.EstadoCliente = data.estado;
                    let vendedorEstetica = data.vendedor.trim();
                    let vendedorPeluqueria = "";
                    if (data.VendedoresGrupoProducto && data.VendedoresGrupoProducto[0]) {
                        vendedorPeluqueria = data.VendedoresGrupoProducto[0].vendedor.trim();
                    }
                    if (vendedorEstetica != Configuracion.VENDEDOR_GENERAL && vendedorPeluqueria == Configuracion.VENDEDOR_GENERAL) {
                        this.rapport.TipoCentro = 1; // Solo estética
                    } else if (vendedorEstetica == Configuracion.VENDEDOR_GENERAL && vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
                        this.rapport.TipoCentro = 2; // Solo peluquería
                    } else if (vendedorEstetica != Configuracion.VENDEDOR_GENERAL && vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
                        this.rapport.TipoCentro = 3; // Estética y peluquería
                    } else {
                        this.rapport.TipoCentro = 0; // No sabemos qué es
                    }
                }
            },
            error => {
                this.errorMessage = <any>error;
            },
            () => {

            })
    }

    public leerClientePrincipal(): void {
        this.leerCliente(this.numeroCliente, '');
    }

    public modificarRapport(): void {

        let confirm = this.alertCtrl.create({
            title: 'Confirmar',
            message: '¿Está seguro que quiere guardar el rapport?',
            buttons: [
                {
                    text: 'Sí',
                    handler: () => {
                        this.modificando = true;
                        // Hay que guardar el pedido original en alguna parte
                        let loading: any = this.loadingCtrl.create({
                            content: 'Guardando Rapport...',
                        });

                        loading.present();

                        this.servicio.crearRapport(this.rapport).subscribe(
                            data => {
                                let alert = this.alertCtrl.create({
                                    title: 'Creado',
                                    subTitle: 'Rapport guardado correctamente',
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                                this.events.publish('rapportCreado', this.rapport);
                                this.modificando = false;
                            },
                            error => {
                                let alert = this.alertCtrl.create({
                                    title: 'Error',
                                    subTitle: 'No se ha podido guardar el rapport.\n' + error.ExceptionMessage,
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                                this.modificando = false;
                            },
                            () => {
                                //loading.dismiss();
                            }
                        );
                    }
                },
                {
                    text: 'No',
                    handler: () => {
                        return;
                    }
                }

            ]
        });

        confirm.present();
    }

    public seleccionarContacto(evento: any): void {
        this.rapport.Contacto = evento.contacto;
        this.rapport.EstadoCliente = evento.estado;
    }

    public seleccionarTexto(evento: any): void {
        //evento.target.select();
        const eventTarget = evento._native.nativeElement;
        eventTarget.select();
    }

    public sePuedeModificar(): boolean {
        let usuarioActual: string = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
        return !this.modificando && this.rapport && this.rapport.Usuario === usuarioActual;
    }

    public mostrarEstadoCliente(estadoCliente: number): void {
        if (estadoCliente == undefined) {
            return;
        }
        let alert: any = this.alertCtrl.create({
            title: 'Info',
            subTitle: 'El cliente está en estado ' + estadoCliente.toString(),
            buttons: ['Ok'],
        });
        alert.present();
    }

    public colorEstado(estado: number): string {
        if (estado == 0 || estado == 9) {
            return "secondary";
        }
        if (estado == 5) {
            return "danger";
        }
        if (estado == 7) {
            return "primary";
        }

        return "default";
    }
}
