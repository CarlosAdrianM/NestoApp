import {Component, Injectable} from '@angular/core';
import {AlertController} from 'ionic-angular';
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
    private _cliente: any;
    get cliente() {
        return this._cliente;
    }
    set cliente(value: any) {
        if (value && value.trim() != this._cliente){
            this.cargarDatos(value);
            this._cliente = value;    
        }
    }
    public seleccionado: string;

    constructor(servicio: SelectorDireccionesEntregaService, alertCtrl: AlertController) {
        super();
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
    }

    public cargarDatos(cliente: any): void {
        if (!cliente) {
            return;
        }
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
                    this.direccionSeleccionada = this.direccionesEntrega.find(d => d.esDireccionPorDefecto);
                    this.seleccionarDato(this.direccionSeleccionada);
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
        //this.cargarDatos(this.cliente);
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
