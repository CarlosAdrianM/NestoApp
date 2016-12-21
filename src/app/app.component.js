var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ProfilePage } from '../pages/profile/profile';
import { Usuario } from '../models/Usuario';
import { Deploy } from '@ionic/cloud-angular';
export var MyApp = (function () {
    function MyApp(platform, deploy, usuario) {
        this.platform = platform;
        this.deploy = deploy;
        this.usuario = usuario;
        this.rootPage = PlantillaVenta;
        this.initializeApp();
        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Plantilla Venta', component: PlantillaVenta },
            { title: 'Pedidos Venta', component: ListaPedidosVenta },
            { title: 'Extracto Cliente', component: ExtractoCliente },
            { title: 'Usuario', component: ProfilePage }
        ];
        if (this.usuario == undefined || this.usuario.nombre == undefined) {
            this.rootPage = ProfilePage;
        }
    }
    MyApp.prototype.initializeApp = function () {
        var _this = this;
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            // Actualizamos a la nueva versi�n
            _this.deploy.check().then(function (snapshotAvailable) {
                if (snapshotAvailable) {
                    _this.deploy.download().then(function () {
                        return _this.deploy.extract();
                    });
                }
            });
        });
    };
    MyApp.prototype.openPage = function (page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    };
    __decorate([
        ViewChild(Nav), 
        __metadata('design:type', Nav)
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Component({
            templateUrl: 'app.html'
        }), 
        __metadata('design:paramtypes', [Platform, Deploy, Usuario])
    ], MyApp);
    return MyApp;
}());
//# sourceMappingURL=app.component.js.map