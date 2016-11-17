import {Component, Injectable, Output, EventEmitter} from '@angular/core';
import {AlertController, LoadingController} from 'ionic-angular';
import {SelectorClientesService} from './SelectorClientes.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-clientes',
    templateUrl: 'SelectorClientes.html',
    // outputs: ['seleccionar']
})

@Injectable()
export class SelectorClientes extends SelectorBase {
    @Output() seleccionar = new EventEmitter();
    private servicio: SelectorClientesService;
    private loadingCtrl: LoadingController;
    private alertCtrl: AlertController;

    constructor(servicio: SelectorClientesService, loadingCtrl: LoadingController, alertCtrl: AlertController) {
        super();
        this.servicio = servicio;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
    }

    public cargarDatos(filtro: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Clientes...',
        });

        loading.present();

        this.servicio.getClientes(filtro).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No se encuentra ningún cliente que coincida con ' + filtro,
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                // loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }
    /*
    public seleccionarCliente(cliente: any): void {
        this.seleccionar.emit(cliente);
    }
    */
    
}
