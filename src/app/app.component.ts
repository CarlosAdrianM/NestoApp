import { Component } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { Usuario } from './models/Usuario';
import { FCM } from '@ionic-native/fcm/ngx';
import { CacheService } from "ionic-cache";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  rootPage : any;
  pages: Array<{ title: string, url: string, icon: string }>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public usuario: Usuario, 
    private alertCtrl: AlertController, 
    cache: CacheService
    //private fcm: FCM
  ) {
    this.initializeApp();

    this.pages = [
      { title: 'Plantilla Venta', url: '/plantilla-venta', icon: 'pencil' },
      { title: 'Pedidos Venta', url: '/lista-pedidos-venta', icon: 'book' },
      { title: 'Extracto Cliente', url: '/extracto-cliente', icon: 'list-outline' },
      { title: 'Rapports', url: '/lista-rapports', icon: 'location' },
      { title: 'Comisiones', url: '/comisiones', icon: 'cash' },
      { title: 'Productos', url: '/lista-productos', icon: 'pricetag' },
      { title: 'Clientes', url: '/cliente', icon: 'people' },
      { title: 'Usuario', url: '/profile', icon: 'person' },
    ];
    
    cache.setDefaultTTL(60 * 60); //set default cache TTL for 1 hour

    if (this.usuario == undefined || this.usuario.nombre == undefined) {
      this.rootPage = ProfileComponent;
    }
        
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
