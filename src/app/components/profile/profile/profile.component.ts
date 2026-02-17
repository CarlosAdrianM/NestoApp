import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Parametros } from 'src/app/services/parametros.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { Storage } from '@ionic/storage';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {

  private LOGIN_URL: string = Configuracion.URL_SERVIDOR + '/oauth/token';
  private SIGNUP_URL: string = Configuracion.URL_SERVIDOR + '/users';

  // When the page loads, we want the Login segment to be selected
  public authType: string = 'login';
  // We need to set the content type for the server
  private contentHeader: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
  });
  public error: string;
  public mostrarOlvideMiContrasenna: boolean;
  public correoContrasennaOlvidada: string;
  public numeroVersionBinarios: string;
  public numeroVersionActualizacion: string;
  public listaSeEstaVendiendo: any;

  constructor(
      private http: HttpClient, 
      public usuario: Usuario, 
      private loadingCtrl: LoadingController, 
      private local: Storage, 
      private parametros: Parametros, 
      private alertCtrl: AlertController,
      public auth: AuthService,
      private firebaseAnalytics: FirebaseAnalytics,
      private appVersion: AppVersion,
      private servicio: ProfileService,
      private nav: NavController,
      ) {
          this.appVersion.getVersionNumber().then((ver) => this.numeroVersionBinarios = ver);
          this.numeroVersionActualizacion = Configuracion.VERSION;
        }

  @ViewChild('inputCorreoContrasenna') correoContrasenna: any;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: {
        delay: 2000
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
  };

  ionViewDidEnter() {
    if(this.usuario && !this.usuario.nombre) {
        this.local.get('profile').then(profile => {
            console.log(profile);
            if (profile) {
                this.usuario.nombre = profile;
                this.firebaseAnalytics.setUserId(this.usuario.nombre);
                this.cargarParametros();
                this.cargarSeEstaVendiendo(null);
            }
        }).catch(error => {
            console.log(error);
            //this.nav.push(ProfilePage);
        });
    }
  }

    cargarSeEstaVendiendo(event: any) {
        this.servicio.getSeEstaVendiendo().subscribe(
            data => {this.listaSeEstaVendiendo = data},
            error => {},
            () => {
                if (event) {
                    event.target.complete();
                }
            }
        );
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
            this.firebaseAnalytics.logEvent("login", {nombre: this.usuario.nombre});
            let datos: any = data;
            this.authSuccess(datos.access_token);
            this.cargarParametros();
        },
        async err => {
            this.error = 'Se ha producido un error al intentar iniciar sesión',
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
    this.firebaseAnalytics.logEvent("logout", {nombre: this.usuario.nombre});
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
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('DelegaciónDefecto').subscribe(
        data => {
            self.usuario.delegacion = data;
        },
        error => {
            console.log('No se ha podido cargar la delegación por defecto');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('AlmacénRuta').subscribe(
        data => {
            self.usuario.almacen = data;
        },
        error => {
            console.log('No se ha podido cargar el almacén por defecto');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );
    
    this.parametros.leer('PermitirVerTodosLosPedidos').subscribe(
        data => {
            self.usuario.permitirVerTodosLosPedidos = data == "1";
        },
        error => {
            self.usuario.permitirVerTodosLosPedidos = false;
            console.log('No se ha podido cargar el parámetro PermitirVerTodosLosPedidos');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirVerClientesTodosLosVendedores').subscribe(
        data => {
            self.usuario.permitirVerClientesTodosLosVendedores = data == "1";
        },
        error => {
            self.usuario.permitirVerClientesTodosLosVendedores = false;
            console.log('No se ha podido cargar el parámetro PermitirVerClientesTodosLosVendedores');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirVerTodosLosVendedores').subscribe(
        data => {
            self.usuario.permitirVerTodosLosVendedores = data == "1";
        },
        error => {
            self.usuario.permitirVerTodosLosVendedores = false;
            console.log('No se ha podido cargar el parámetro PermitirVerTodosLosVendedores');
            this.error = '¡Ups! Parece que no tienes conexión';
        }
    );

    this.parametros.leer('PermitirCrearPedidoConErroresValidacion').subscribe(
        data => {
            self.usuario.permitirCrearPedidoConErroresValidacion = data == "1";
        },
        error => {
            self.usuario.permitirCrearPedidoConErroresValidacion = false;
            console.log('No se ha podido cargar el parámetro PermitirCrearPedidoConErroresValidacion');
        }
    );
}

    async olvideMiContrasenna(correo: string) {
        let alert = await this.alertCtrl.create({
            header: 'Contraseña',
            message: '¿Está seguro que desea cambiar su contraseña?',
            buttons: [
                {
                    text:'Sí',
                    handler: () => {
                        this.llamarApiOlvideContrasenna(correo);
                    }
                },
                {
                    text:'No',
                    role: 'cancel',
                }
            ],
        });
        await alert.present();
    }

    async llamarApiOlvideContrasenna(correo: string) {
        let loading: any = await this.loadingCtrl.create({
            message: 'Reseteando contraseña...',
        })
        
        await loading.present();

        const url_ = Configuracion.API_URL+'/Accounts/OlvideMiContrasenna';
        const params = new URLSearchParams();
        params.set('correo', correo);

        this.http.post(
            url_,
            params,
            {
                headers: this.contentHeader,
                params: {
                    correo: correo,
                }
            })
            .subscribe(
            async () => {
                let alert = await this.alertCtrl.create({
                    header: 'Contraseña',
                    subHeader: 'Le hemos enviado un correo electrónico',
                    message: 'Haga clic en el enlace del correo para cambiar la contraseña',
                    buttons: ['Ok'],
                });
                await alert.present();
                this.mostrarOlvideMiContrasenna = false;
            },
            async () => {
                this.loadingCtrl.dismiss();
                this.error = 'No se ha podido conectar con el servidor para recuperar la contraseña';
            },
            async () => {
                this.loadingCtrl.dismiss();
            }
        );        
    }

    mostrarOcultarOlvideContrasenna() {
        this.mostrarOlvideMiContrasenna = !this.mostrarOlvideMiContrasenna;
        if (this.mostrarOlvideMiContrasenna) {
            setTimeout(() => {
                this.correoContrasenna.setFocus();            
            }, 200);    
        }
    }

    public abrirEnlace(urlDestino: string): void {
        urlDestino += "&utm_medium=seestavendiendo";
        this.firebaseAnalytics.logEvent("se_esta_vendiendo_abrir_enlace", {enlace: urlDestino});
        window.open(urlDestino, '_system', 'location=yes');
    }

    public abrirFichaProducto(producto: any): void {
        this.nav.navigateForward("/producto", { queryParams: { empresa: "1", producto: producto.Producto }});
    }

}
