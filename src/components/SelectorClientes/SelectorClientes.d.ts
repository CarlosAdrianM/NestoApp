import { EventEmitter } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';
import { SelectorClientesService } from './SelectorClientes.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
export declare class SelectorClientes extends SelectorBase {
    seleccionar: EventEmitter<{}>;
    private servicio;
    private loadingCtrl;
    private alertCtrl;
    constructor(servicio: SelectorClientesService, loadingCtrl: LoadingController, alertCtrl: AlertController);
    cargarDatos(filtro: string): void;
}
