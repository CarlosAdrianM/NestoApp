import { Component, ViewChild } from '@angular/core';
import { NavParams, AlertController, LoadingController, Events, NavController } from 'ionic-angular';
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
    dejarDeVisitar: boolean = false;
    private vendedorEstetica: string;
    private vendedorPeluqueria: string;

    constructor(navParams: NavParams, private servicio: RapportService, 
        private alertCtrl: AlertController, private loadingCtrl: LoadingController, 
        private usuario: Usuario, public events: Events, private nav: NavController) {
        this.rapport = navParams.get('rapport');
        this.numeroCliente = this.rapport.Cliente;
        if (!this.rapport.Id) {
            this.rapport.Tipo = usuario.ultimoTipoRapport;
        }
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
                    //this.rapport.Contacto = data.contacto;
                    this.rapport.Direccion = data.direccion;
                    this.rapport.Nombre = data.nombre;
                    this.rapport.EstadoCliente = data.estado;
                    this.vendedorEstetica = data.vendedor.trim();
                    this.vendedorPeluqueria = "";
                    if (data.VendedoresGrupoProducto && data.VendedoresGrupoProducto[0]) {
                        this.vendedorPeluqueria = data.VendedoresGrupoProducto[0].vendedor.trim();
                    }
                    if (this.vendedorEstetica != Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria == Configuracion.VENDEDOR_GENERAL) {
                        this.rapport.TipoCentro = 1; // Solo estética
                    } else if (this.vendedorEstetica == Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
                        this.rapport.TipoCentro = 2; // Solo peluquería
                    } else if (this.vendedorEstetica != Configuracion.VENDEDOR_GENERAL && this.vendedorPeluqueria != Configuracion.VENDEDOR_GENERAL) {
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
                        if (!this.mostrarEstadoCliente) {
                            this.rapport.TipoCentro = 0; // no se sabe
                        }
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
                                if (this.dejarDeVisitar) {
                                    this.servicio.dejarDeVisitar(this.rapport, this.vendedorEstetica, this.vendedorPeluqueria).subscribe(
                                        data => {
                                            let alertOK = this.alertCtrl.create({
                                                title: 'Clientes',
                                                subTitle: 'Se ha sacado el cliente de la cartera',
                                                buttons: ['Ok'],
                                            });
                                            alertOK.present();
                                            this.nav.pop();
                                        },
                                        error => {
                                            let alertKO = this.alertCtrl.create({
                                                title: 'Error',
                                                subTitle: 'No se ha podido quitar el cliente.\n' + error.ExceptionMessage,
                                                buttons: ['Ok'],
                                            });
                                            alertKO.present();
                                        },
                                        () => {
                                            //loading.dismiss();
                                        }
                                    );
                                }        
                                loading.dismiss();
                                this.events.publish('rapportCreado', this.rapport);
                                this.modificando = false;
                                this.usuario.ultimoTipoRapport = this.rapport.Tipo;
                                if (!this.dejarDeVisitar) {
                                    this.nav.pop();
                                }
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
        var sePuedePorUsuario = !this.modificando && this.rapport && this.rapport.Usuario === usuarioActual;
        var sePuedePorDejarDeVisitar = !this.dejarDeVisitar || (this.rapport && this.rapport.Comentarios && this.rapport.Comentarios.length > 50);
        return sePuedePorUsuario && sePuedePorDejarDeVisitar;
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

    public mostrarTipoCentro(): boolean {
        return (this.rapport.Id == null || this.rapport.Id == 0) && this.vendedorEstetica == this.vendedorPeluqueria && this.vendedorEstetica == this.usuario.vendedor;
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
