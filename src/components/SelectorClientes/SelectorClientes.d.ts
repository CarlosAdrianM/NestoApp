import { EventEmitter } from '@angular/core';
import { AlertController, LoadingController } from 'ionic-angular';
import { SelectorClientesService } from './SelectorClientes.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
import { Keyboard } from '@ionic-native/keyboard';
export declare class SelectorClientes extends SelectorBase {
    private keyboard;
    seleccionar: EventEmitter<{}>;
    private servicio;
    private loadingCtrl;
    private alertCtrl;
    constructor(servicio: SelectorClientesService, loadingCtrl: LoadingController, alertCtrl: AlertController, keyboard: Keyboard);
    myIonSearchBar: any;
    ngAfterViewInit(): void;
    setFocus(): void;
    cargarDatos(filtro: string): void;
}
