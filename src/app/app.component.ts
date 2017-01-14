import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ProfilePage } from '../pages/profile/profile';
import {Usuario} from '../models/Usuario';


import { Deploy } from '@ionic/cloud-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = PlantillaVenta;

    pages: Array<{ title: string, component: any }>;

    constructor(public platform: Platform, public deploy: Deploy, public usuario: Usuario) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Plantilla Venta', component: PlantillaVenta },
            { title: 'Pedidos Venta', component: ListaPedidosVenta },
            { title: 'Extracto Cliente', component: ExtractoCliente },
            { title: 'Usuario', component: ProfilePage }
        ];

        if (this.usuario == undefined || this.usuario.nombre == undefined) {
            this.rootPage = ProfilePage;
        }

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();


            // Actualizamos a la nueva versión
            this.deploy.check().then((snapshotAvailable: boolean) => {
                if (snapshotAvailable) {
                    this.deploy.download().then(() => {
                        return this.deploy.extract();
                    });
                }
            });
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}