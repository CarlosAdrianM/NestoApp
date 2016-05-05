"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var http_1 = require('angular2/http');
var common_1 = require('angular2/common');
var angular2_jwt_1 = require('angular2-jwt');
var auth_1 = require('../../services/auth/auth');
require('rxjs/add/operator/map');
var configuracion_1 = require('../../componentes/configuracion/configuracion');
var Usuario_1 = require('../../models/Usuario');
var ProfilePage = (function () {
    function ProfilePage(http, usuario, nav) {
        this.LOGIN_URL = configuracion_1.Configuracion.URL_SERVIDOR + '/oauth/token';
        this.SIGNUP_URL = configuracion_1.Configuracion.URL_SERVIDOR + '/users';
        // When the page loads, we want the Login segment to be selected
        this.authType = 'login';
        // We need to set the content type for the server
        this.contentHeader = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });
        this.jwtHelper = new angular2_jwt_1.JwtHelper();
        this.local = new ionic_angular_1.Storage(ionic_angular_1.LocalStorage);
        // let self: any = this;
        this.http = http;
        this.auth = auth_1.AuthService;
        this.nav = nav;
        this.usuario = usuario;
        /*
        this.local.get('profile').then(profile => {
            self.usuario.nombre = JSON.parse(profile);
        }).catch(error => {
            console.log(error);
        });
        */
    }
    ProfilePage.prototype.login = function (credentials) {
        var _this = this;
        var loading = ionic_angular_1.Loading.create({
            content: 'Iniciando sesión...',
        });
        this.nav.present(loading);
        // credentials.grant_type = 'password';
        this.http.post(this.LOGIN_URL, 'username=' + encodeURIComponent(credentials.username) +
            '&password=' + encodeURIComponent(credentials.password) +
            '&grant_type=password', {
            headers: this.contentHeader,
        })
            .map(function (res) { return res.json(); })
            .subscribe(function (data) { return _this.authSuccess(data.access_token); }, function (err) {
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
        this.usuario.nombre = this.jwtHelper.decodeToken(token).unique_name;
        this.local.set('profile', JSON.stringify(this.usuario.nombre));
    };
    ProfilePage = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/profile/profile.html',
            directives: [common_1.FORM_DIRECTIVES],
        }), 
        __metadata('design:paramtypes', [http_1.Http, Usuario_1.Usuario, ionic_angular_1.NavController])
    ], ProfilePage);
    return ProfilePage;
}());
exports.ProfilePage = ProfilePage;
