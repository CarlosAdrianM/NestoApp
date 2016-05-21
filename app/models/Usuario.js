'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
//import { ProfilePage } from '../pages/profile/profile';
var Usuario = (function () {
    function Usuario() {
        var _this = this;
        this.local = new ionic_angular_1.Storage(ionic_angular_1.LocalStorage);
        this.almacen = 'ALG';
        this.delegacion = 'ALG';
        this.formaVenta = 'DIR';
        this.local.get('profile').then(function (profile) {
            _this.nombre = JSON.parse(profile);
        }).catch(function (error) {
            console.log(error);
        });
        /*
        if (!this.nombre) {
            this.nav.push(ProfilePage);
        }
        */
    }
    Usuario = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Usuario);
    return Usuario;
}());
exports.Usuario = Usuario;
