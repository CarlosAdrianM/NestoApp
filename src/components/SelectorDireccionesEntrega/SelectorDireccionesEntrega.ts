import {Component, Injectable} from '@angular/core';
import {Searchbar, List, Item, AlertController, Icon} from 'ionic-angular';
import {SelectorDireccionesEntregaService} from './SelectorDireccionesEntrega.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-direcciones-entrega',
    templateUrl: 'SelectorDireccionesEntrega.html',
    inputs: ['cliente', 'seleccionado'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorDireccionesEntrega extends SelectorBase {
    private servicio: SelectorDireccionesEntregaService;
    private alertCtrl: AlertController;
    public direccionesEntrega: any[];
    public direccionSeleccionada: any;

    // @Input() 
    public cliente: any;
    public seleccionado: string = "0";

    constructor(servicio: SelectorDireccionesEntregaService, alertCtrl: AlertController) {
        super();
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
    }

    public cargarDatos(cliente: any): void {
        this.servicio.direccionesEntrega(cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'El cliente ' + cliente.cliente + ' no tiene ninguna dirección de entrega',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.direccionesEntrega = data;
                    this.direccionSeleccionada = undefined;
                    let i: number = 0;
                    while (this.direccionSeleccionada === undefined) {
                        if (i + 1 > this.direccionesEntrega.length) {
                            throw 'Error en la API de Nesto: cliente sin dirección por defecto';
                        }
                        if (this.seleccionado === undefined) {
                            if (this.direccionesEntrega[i].esDireccionPorDefecto) {
                                this.direccionSeleccionada = this.direccionesEntrega[i];
                                this.seleccionarDato(this.direccionSeleccionada);
                            }
                        } else {
                            if (this.seleccionado === this.direccionesEntrega[i].contacto) {
                                this.direccionSeleccionada = this.direccionesEntrega[i];
                                this.seleccionarDato(this.direccionSeleccionada);
                            }
                        }
                        i++;
                    }
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    public seleccionarDireccion(direccion: any): void {
        this.direccionSeleccionada = direccion;
        this.seleccionarDato(direccion);
    }

    public ngOnChanges(changes): void {
        this.cargarDatos(this.cliente);
    }
}
