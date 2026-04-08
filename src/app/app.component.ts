import { Component } from '@angular/core';

import { AlertController, Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { Usuario } from './models/Usuario';
import { FCM } from '@awesome-cordova-plugins/fcm/ngx';
import { HttpClient } from '@angular/common/http';
import { CacheService } from "./services/cache.service";
import { Configuracion } from './components/configuracion/configuracion/configuracion.component';
import { Router } from '@angular/router';


@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: false
})
export class AppComponent {
  rootPage : any;
  pages: Array<{ title: string, url: string, icon: string }>;
  public tokenFCM: string = null;
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

  private async inicializarNotificacionesPush() {
    if (!this.platform.is('cordova')) {
      return;
    }

    // Android 13+ (API 33+) requiere solicitar permiso POST_NOTIFICATIONS en runtime
    try {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const permiso = await Notification.requestPermission();
        console.log('Permiso de notificaciones:', permiso);
        if (permiso !== 'granted') {
          console.log('Permiso de notificaciones denegado por el usuario');
        }
      }
    } catch (err) {
      console.log('Error solicitando permiso de notificaciones:', err);
    }

    // Guardar el token FCM para registrarlo después del login
    this.fcm.getToken().then(token => {
      console.log('FCM token obtenido:', token);
      this.tokenFCM = token;
    }).catch(err => {
      console.log('Error al obtener token FCM:', err);
    });

    // Escuchar renovación de token
    this.fcm.onTokenRefresh().subscribe(token => {
      console.log('FCM token renovado:', token);
      this.tokenFCM = token;
      // Si ya hay usuario logueado, registrar inmediatamente
      if (this.usuario && this.usuario.nombre) {
        this.registrarTokenEnBackend(token);
      }
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

  public registrarDispositivoPush() {
    if (this.tokenFCM) {
      this.registrarTokenEnBackend(this.tokenFCM);
    }
  }

  private registrarTokenEnBackend(token: string) {
    const url = Configuracion.API_URL + '/Notificaciones/RegistrarDispositivo';
    const body = {
      Token: token,
      Plataforma: 'android',
      Aplicacion: 'NestoApp'
    };
    console.log('Registrando dispositivo FCM:', JSON.stringify(body));
    this.http.post(url, body).subscribe(
      (response) => console.log('Token FCM registrado en backend. Respuesta:', JSON.stringify(response)),
      (err) => {
        console.error('Error registrando token FCM:', err.status, err.statusText);
        console.error('Error body:', JSON.stringify(err.error));
      }
    );
  }
}
