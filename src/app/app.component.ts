import { Component } from '@angular/core';

import { AlertController, Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { Usuario } from './models/Usuario';
import { FCM } from '@ionic-native/fcm/ngx';
import { HttpClient } from '@angular/common/http';
import { CacheService } from "ionic-cache";
import { Configuracion } from './components/configuracion/configuracion/configuracion.component';
import { Router } from '@angular/router';


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
    private toastCtrl: ToastController,
    private fcm: FCM,
    private http: HttpClient,
    private router: Router,
    cache: CacheService
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
      this.inicializarNotificacionesPush();
    });
  }

  private inicializarNotificacionesPush() {
    if (!this.platform.is('cordova')) {
      return;
    }

    // Obtener token FCM y registrarlo en el backend
    this.fcm.getToken().then(token => {
      console.log('FCM token obtenido:', token);
      this.registrarTokenEnBackend(token);
    }).catch(err => {
      console.log('Error al obtener token FCM:', err);
    });

    // Escuchar renovación de token
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log('FCM token renovado:', token);
      this.registrarTokenEnBackend(token);
    });

    // Escuchar notificaciones
    this.fcm.onNotification().subscribe(async (payload: any) => {
      if (payload.wasTapped) {
        // El usuario tocó la notificación desde la bandeja → navegar
        if (payload.ruta) {
          this.router.navigateByUrl(payload.ruta);
        }
      } else {
        // Notificación recibida en foreground → mostrar toast
        const toast = await this.toastCtrl.create({
          header: payload.title,
          message: payload.body,
          duration: 5000,
          position: 'top',
          buttons: payload.ruta ? [{
            text: 'Ver',
            handler: () => {
              this.router.navigateByUrl(payload.ruta);
            }
          }] : []
        });
        await toast.present();
      }
    });
  }

  private registrarTokenEnBackend(token: string) {
    const url = Configuracion.API_URL + '/Notificaciones/RegistrarDispositivo';
    this.http.post(url, {
      token: token,
      plataforma: 'android',
      aplicacion: 'NestoApp'
    }).subscribe(
      () => console.log('Token FCM registrado en backend'),
      (err) => console.log('No se pudo registrar el token FCM (endpoint aún no disponible):', err.status)
    );
  }
}
