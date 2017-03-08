import { LoadingController, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { AuthService } from '../../services/auth/auth';
import 'rxjs/add/operator/map';
import { Usuario } from '../../models/Usuario';
import { Parametros } from '../../services/Parametros.service';
export declare class ProfilePage {
    private parametros;
    private LOGIN_URL;
    private SIGNUP_URL;
    auth: AuthService;
    authType: string;
    private contentHeader;
    error: string;
    private local;
    private http;
    usuario: Usuario;
    private nav;
    private loadingCtrl;
    constructor(http: Http, usuario: Usuario, nav: NavController, loadingCtrl: LoadingController, local: Storage, parametros: Parametros);
    ionViewDidEnter(): void;
    login(credentials: any): void;
    signup(credentials: any): void;
    logout(): void;
    private authSuccess(token);
    private cargarParametros();
}
