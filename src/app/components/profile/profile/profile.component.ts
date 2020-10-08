import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Parametros } from 'src/app/services/parametros.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { FCM } from '@ionic-native/fcm/ngx';
import { Storage } from '@ionic/storage';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {

  private LOGIN_URL: string = Configuracion.URL_SERVIDOR + '/oauth/token';
  private SIGNUP_URL: string = Configuracion.URL_SERVIDOR + '/users';

  // When the page loads, we want the Login segment to be selected
  public authType: string = 'login';
  // We need to set the content type for the server
  private contentHeader: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
  });
  public error: string;
  private local: Storage;
  private http: HttpClient;
  public usuario: Usuario;
  private loadingCtrl: LoadingController;

  constructor(http: HttpClient, usuario: Usuario, loadingCtrl: LoadingController, 
      local: Storage, private parametros: Parametros, 
      private alertCtrl: AlertController,
      public auth: AuthService) {
    this.http = http;
    this.loadingCtrl = loadingCtrl;
    this.usuario = usuario;
    this.local = local;
  }

  ngOnInit() {}

  ionViewDidEnter() {
    if(this.usuario && !this.usuario.nombre) {
        this.local.get('profile').then(profile => {
            console.log(profile);
            this.usuario.nombre = profile;
            this.cargarParametros();
        }).catch(error => {
            console.log(error);
            //this.nav.push(ProfilePage);
        });
    }
  }

  async login(credentials: any) {
    let loading: any = await this.loadingCtrl.create({
        message: 'Iniciando sesión...',
    })
    
    await loading.present();

    // credentials.grant_type = 'password';
    this.http.post(
        this.LOGIN_URL,
        'username=' + encodeURIComponent(credentials.username) +
        '&password=' + encodeURIComponent(credentials.password) +
        '&grant_type=password',
        {
            headers: this.contentHeader,
        })
        .subscribe(
        data => {
            this.usuario.nombre = credentials.username;
            let datos: any = data;
            this.authSuccess(datos.access_token);
            this.cargarParametros();
        },
        async err => {
            this.error = err,
            await loading.dismiss();
        },
        async () => {
            await loading.dismiss();
        }
    );
}

public signup(credentials: any): void {
    this.http.post(this.SIGNUP_URL, JSON.stringify(credentials), { headers: this.contentHeader })
        .subscribe(
        data => {
            let datos: any = data;
            this.authSuccess(datos.id_token);
        },
        err => this.error = err
    );
}

public logout(): void {
    this.local.remove('id_token');
    this.local.remove('profile');
    this.usuario.nombre = null;
}

private authSuccess(token: any): void {
    this.error = null;
    this.local.set('id_token', token);
    // this.usuario.nombre = this.jwtHelper.decodeToken(token).unique_name;
    this.local.set('profile', this.usuario.nombre.trim());
}

private cargarParametros(): void {
    let self: any = this;

    this.parametros.leer('Vendedor').subscribe(
        data => {
            self.usuario.vendedor = data;
        },
        error => {
            console.log('No se ha podido cargar el vendedor por defecto');
        }
    );

    this.parametros.leer('DelegaciónDefecto').subscribe(
        data => {
            self.usuario.delegacion = data;
        },
        error => {
            console.log('No se ha podido cargar la delegación por defecto');
        }
    );

    this.parametros.leer('AlmacénRuta').subscribe(
        data => {
            self.usuario.almacen = data;
        },
        error => {
            console.log('No se ha podido cargar el almacén por defecto');
        }
    );

}
    /*
    public getToken() {
    this.fcm.getToken().then(token => {
        //backend.registerToken(token);
        this.alertCtrl.create({
            message: 'Profile',
            subHeader: `Obtained token: ${token}`,
            buttons: ['Ok'],
        }).then(alert => alert.present());
        
        console.log(`Obtained token: ${token}`);
        })    
    }
    */

}
