import {Page, Storage, LocalStorage} from 'ionic-angular';
import {Http, Headers} from 'angular2/http';
import {FORM_DIRECTIVES} from 'angular2/common';
import {JwtHelper} from 'angular2-jwt';
import {AuthService} from '../../services/auth/auth';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../componentes/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Page({
    templateUrl: 'build/pages/profile/profile.html',
    directives: [FORM_DIRECTIVES],
})
export class ProfilePage {
    private LOGIN_URL: string = Configuracion.URL_SERVIDOR + '/oauth/token';
    private SIGNUP_URL: string = Configuracion.URL_SERVIDOR + '/users';

    private auth: AuthService;
    // When the page loads, we want the Login segment to be selected
    public authType: string = 'login';
    // We need to set the content type for the server
    private contentHeader: Headers = new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
    });
    private error: string;
    private jwtHelper: JwtHelper = new JwtHelper();
    private local: Storage = new Storage(LocalStorage);
    private http: Http;
    private usuario: Usuario;

    constructor(http: Http, usuario: Usuario) {
        let self: any = this;
        this.http = http;
        this.auth = AuthService;
        self.usuario = usuario;
        this.local.get('profile').then(profile => {
            self.usuario.nombre = JSON.parse(profile);
        }).catch(error => {
            console.log(error);
        });
    }

    public login(credentials: any): void {
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
            data => this.authSuccess(data.access_token),
            err => this.error = err
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
        this.usuario.nombre = null;
    }

    private authSuccess(token: any): void {
        this.error = null;
        this.local.set('id_token', token);
        this.usuario.nombre = this.jwtHelper.decodeToken(token).unique_name;
        this.local.set('profile', JSON.stringify(this.usuario.nombre));
    }
}
