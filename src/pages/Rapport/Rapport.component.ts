import { Component } from '@angular/core';
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';


@Component({
    templateUrl: 'Rapport.html',
})
export class RapportComponent {

    public rapport: any;
    public errorMessage: string;
    public numeroCliente: string;

    constructor(navParams: NavParams, private servicio: RapportService, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
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
                        // Hay que guardar el pedido original en alguna parte
                        let loading: any = this.loadingCtrl.create({
                            content: 'Guardando Rapport...',
                        });

                        loading.present();

                        this.servicio.crearRapport(this.rapport).subscribe(
                            data => {
                                let alert = this.alertCtrl.create({
                                    title: 'Creado',
                                    subTitle: 'Rapport creado correctamente',
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
                                // this.reinicializar();
                            },
                            error => {
                                let alert = this.alertCtrl.create({
                                    title: 'Error',
                                    subTitle: 'No se ha podido crear el rapport.\n' + error,
                                    buttons: ['Ok'],
                                });
                                alert.present();
                                loading.dismiss();
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
    }

    public seleccionarTexto(evento: any): void {
        evento.target.select();
    }

}
