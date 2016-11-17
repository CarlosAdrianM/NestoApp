var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { LoadingController, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers } from '@angular/http';
import { AuthService } from '../../services/auth/auth';
import 'rxjs/add/operator/map';
import { Configuracion } from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';
export var ProfilePage = (function () {
    function ProfilePage(http, usuario, nav, loadingCtrl, local) {
        this.LOGIN_URL = Configuracion.URL_SERVIDOR + '/oauth/token';
        this.SIGNUP_URL = Configuracion.URL_SERVIDOR + '/users';
        // When the page loads, we want the Login segment to be selected
        this.authType = 'login';
        // We need to set the content type for the server
        this.contentHeader = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        // let self: any = this;
        this.http = http;
        this.auth = new AuthService();
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
    ProfilePage.prototype.login = function (credentials) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Iniciando sesión...',
        });
        loading.present();
        // credentials.grant_type = 'password';
        this.http.post(this.LOGIN_URL, 'username=' + encodeURIComponent(credentials.username) +
            '&password=' + encodeURIComponent(credentials.password) +
            '&grant_type=password', {
            headers: this.contentHeader,
        })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.usuario.nombre = credentials.username;
            _this.authSuccess(data.access_token);
        }, function (err) {
            _this.error = err,
                loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    ProfilePage.prototype.signup = function (credentials) {
        var _this = this;
        this.http.post(this.SIGNUP_URL, JSON.stringify(credentials), { headers: this.contentHeader })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.authSuccess(data.id_token); }, function (err) { return _this.error = err; });
    };
    ProfilePage.prototype.logout = function () {
        this.local.remove('id_token');
        this.local.remove('profile');
        this.usuario.nombre = null;
    };
    ProfilePage.prototype.authSuccess = function (token) {
        this.error = null;
        this.local.set('id_token', token);
        // this.usuario.nombre = this.jwtHelper.decodeToken(token).unique_name;
        this.local.set('profile', this.usuario.nombre.trim());
    };
    ProfilePage = __decorate([
        Component({
            templateUrl: 'profile.html',
        }), 
        __metadata('design:paramtypes', [Http, Usuario, NavController, LoadingController, Storage])
    ], ProfilePage);
    return ProfilePage;
}());
//# sourceMappingURL=profile.js.map