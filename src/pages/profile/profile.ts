import {Component} from '@angular/core';
import {LoadingController, NavController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Http, Headers} from '@angular/http';
//import {FORM_DIRECTIVES} from '@angular/forms';
import {JwtHelper} from 'angular2-jwt';
import {AuthService} from '../../services/auth/auth';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Component({
    templateUrl: 'profile.html',
})
export class ProfilePage {
    private LOGIN_URL: string = Configuracion.URL_SERVIDOR + '/oauth/token';
    private SIGNUP_URL: string = Configuracion.URL_SERVIDOR + '/users';

    public auth: AuthService;
    // When the page loads, we want the Login segment to be selected
    public authType: string = 'login';
    // We need to set the content type for the server
    private contentHeader: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
    });
    public error: string;
    private jwtHelper: JwtHelper = new JwtHelper();
    private local: Storage;
    private http: Http;
    public usuario: Usuario;
    private nav: NavController;
    private loadingCtrl: LoadingController;

    constructor(http: Http, usuario: Usuario, nav: NavController, loadingCtrl: LoadingController, local: Storage) {
        // let self: any = this;
        this.http = http;
        this.auth = AuthService;
        this.nav = nav;
        this.loadingCtrl = loadingCtrl;
        this.usuario = usuario;
        this.local = local;
        /*
        this.local.get('profile').then(profile => {
            self.usuario.nombre = JSON.parse(profile);
        }).catch(error => {
            console.log(error);
        });
        */
        

        
    }

    /*
    ionViewDidEnter() {
        console.log('ionViewDidEnter');
        let self: any = this;

        this.local.get('profile').then(profile => {
            self.usuario.nombre = profile;
        }).catch(error => {
            console.log(error);
        });
        
        this.local.get('id_token').then(id_token => {
            self.token = id_token;
        }).catch(error => {
            console.log(error);
            });

        console.log('Token:' + this.token);
    }
    */

    public login(credentials: any): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Iniciando sesión...',
        });

        loading.present();

        // credentials.grant_type = 'password';
        this.http.post(
            this.LOGIN_URL,
            'username=' + encodeURIComponent(credentials.username) +
            '&password=' + encodeURIComponent(credentials.password) +
            '&grant_type=password',
            {
                headers: this.contentHeader,
            })
            .map(res => res.json())
            .subscribe(
            data => {
                this.usuario.nombre = credentials.username;
                this.authSuccess(data.access_token);
            },
            err => {
                this.error = err,
                loading.dismiss();
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public signup(credentials: any): void {
        this.http.post(this.SIGNUP_URL, JSON.stringify(credentials), { headers: this.contentHeader })
            .map(res => res.json())
            .subscribe(
            data => this.authSuccess(data.id_token),
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
}
