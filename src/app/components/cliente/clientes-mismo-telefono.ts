import { Component } from '@angular/core';
import { ModalController, NavController, NavParams } from '@ionic/angular';

@Component({
    templateUrl: 'clientes-mismo-telefono.html',
})
export class ClientesMismoTelefonoComponent {

    listaClientes: any;

    constructor(private modalCtrl: ModalController, params: NavParams) {
        this.listaClientes = params.data.listaClientes;
    }

    cerrar() {
        this.modalCtrl.dismiss();
    }
}