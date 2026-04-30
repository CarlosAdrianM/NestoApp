import { Component } from '@angular/core';

import { AlertController, Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { Usuario } from './models/Usuario';
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
    public usuario: Usuario,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
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
    this.platform.ready().then(async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Default });
        await SplashScreen.hide();
      }
      this.inicializarNotificacionesPush();
    });
  }

  private async inicializarNotificacionesPush() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Solicitar permiso (Capacitor gestiona POST_NOTIFICATIONS de Android 13+ automáticamente)
      const permiso = await FirebaseMessaging.requestPermissions();
      if (permiso.receive !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return;
      }

      // Obtener token FCM inicial
      const { token } = await FirebaseMessaging.getToken();
      console.log('FCM token obtenido:', token);
      this.tokenFCM = token;

      // Escuchar renovación de token
      FirebaseMessaging.addListener('tokenReceived', (event) => {
        console.log('FCM token renovado:', event.token);
        this.tokenFCM = event.token;
        if (this.usuario && this.usuario.nombre) {
          this.registrarTokenEnBackend(event.token);
        }
      });

      // Escuchar notificaciones recibidas en foreground
      FirebaseMessaging.addListener('notificationReceived', async (event) => {
        const notification = event.notification;
        const ruta = notification.data?.['ruta'] as string | undefined;
        const toast = await this.toastCtrl.create({
          header: notification.title,
          message: notification.body,
          duration: 5000,
          position: 'top',
          buttons: ruta ? [{
            text: 'Ver',
            handler: () => {
              this.router.navigateByUrl(ruta);
            }
          }] : []
        });
        await toast.present();
      });

      // Escuchar pulsaciones sobre notificaciones (foreground o background)
      FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        const ruta = event.notification.data?.['ruta'] as string | undefined;
        if (ruta) {
          this.router.navigateByUrl(ruta);
        }
      });
    } catch (err) {
      console.log('Error inicializando notificaciones push:', err);
    }
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
