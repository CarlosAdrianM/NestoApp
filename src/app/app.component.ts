import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ListaRapports } from '../pages/ListaRapports/ListaRapports.component';
import { ProfilePage } from '../pages/profile/profile';
import { Usuario } from '../models/Usuario';
import { FCM } from '@ionic-native/fcm';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { PedidoVentaComponent } from '../pages/PedidoVenta/PedidoVenta.component';
import { ComisionesComponent } from '../pages/Comisiones/Comisiones.component';
import { ProductoComponent } from '../pages/Producto/Producto.component';

@Component({
    templateUrl: 'app.html', 
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = PlantillaVenta;

    pages: Array<{ title: string, component: any }>;

    constructor(public platform: Platform, public usuario: Usuario, private statusBar: StatusBar, private alertCtrl: AlertController, private fcm: FCM) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Plantilla Venta', component: PlantillaVenta },
            { title: 'Pedidos Venta', component: ListaPedidosVenta },
            { title: 'Extracto Cliente', component: ExtractoCliente },
            { title: 'Rapports', component: ListaRapports },
          { title: 'Comisiones', component: ComisionesComponent },
          { title: 'Productos', component: ProductoComponent },
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
          this.statusBar.styleDefault();
          
          this.fcm.onTokenRefresh().subscribe(token => {
            alert('token refreshed: ' + token);
          });

            this.fcm.subscribeToTopic(this.usuario.nombre);
            
            this.fcm.getToken().then(token => {
                // backend.registerToken(token);
            });
            
            this.fcm.onNotification().subscribe(data => {
                if(data.wasTapped) {
                    this.nav.push(PedidoVentaComponent, { empresa: data.empresa, numero: data.numero });
                } else {
                    let alert: any = this.alertCtrl.create({
                        title: 'Nuevo Pedido ' + data.numero,
                        message: '¿Quieres verlo ahora?',
                        buttons: [
                            {
                                text: 'No',
                                role: 'cancel',
                                handler: (): any => {
                                    return;
                                },
                            },
                            {
                                text: 'Sí',
                                handler: (): any => {
                                    this.nav.push(PedidoVentaComponent, { empresa: data.empresa, numero: data.numero });
                                },
                            },
                        ],
                    });
                    alert.present();
         
                };
            });

          //this.fcm.unsubscribeFromTopic('marketing');
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }
}
