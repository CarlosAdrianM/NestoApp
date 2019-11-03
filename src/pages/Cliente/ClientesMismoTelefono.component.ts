import { Component } from "@angular/core";
import { NavParams, NavController } from "ionic-angular";

@Component({
    templateUrl: 'ClientesMismoTelefono.html',
})
export class ClientesMismoTelefonoComponent {

    listaClientes: any;

    constructor(private nav: NavController, params: NavParams) {
        this.listaClientes = params.data;
    }

    cerrar() {
        this.nav.pop();
    }
}