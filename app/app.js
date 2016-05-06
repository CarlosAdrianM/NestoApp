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
var core_1 = require('angular2/core');
var ionic_angular_1 = require('ionic-angular');
var http_1 = require('angular2/http');
var angular2_jwt_1 = require('angular2-jwt');
var Usuario_1 = require('./models/Usuario');
var profile_1 = require('./pages/profile/profile');
var ExtractoCliente_1 = require('./pages/ExtractoCliente/ExtractoCliente');
var PlantillaVenta_1 = require('./pages/PlantillaVenta/PlantillaVenta');
var NestoApp = (function () {
    function NestoApp(app, platform, usuario) {
        this.app = app;
        this.platform = platform;
        this.usuario = usuario;
        this.rootPage = PlantillaVenta_1.PlantillaVenta;
        this.initializeApp();
        // set our app's pages
        this.pages = [
            { title: 'Plantilla Venta', component: PlantillaVenta_1.PlantillaVenta },
            // { title: 'Pedidos Venta', component: ListaPedidosVenta},
            { title: 'Extracto Cliente', component: ExtractoCliente_1.ExtractoCliente },
            { title: 'Usuario', component: profile_1.ProfilePage },
        ];
    }
    NestoApp.prototype.initializeApp = function () {
        this.platform.ready().then(function () {
            // The platform is now ready. Note: if this callback fails to fire, follow
            // the Troubleshooting guide for a number of possible solutions:
            //
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            //
            // First, let's hide the keyboard accessory bar (only works natively) since
            // that's a better default:
            //
            // Keyboard.setAccessoryBarVisible(false);
            //
            // For example, we might change the StatusBar color. This one below is
            // good for dark backgrounds and light text:
            // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
        });
    };
    NestoApp.prototype.openPage = function (page) {
        // close the menu when clicking a link from the menu
        this.app.getComponent('leftMenu').close();
        // navigate to the new page if it is not the current page
        this.app.getComponent('nav').setRoot(page.component);
    };
    ;
    NestoApp = __decorate([
        ionic_angular_1.App({
            templateUrl: 'build/app.html',
            config: {},
            providers: [
                core_1.provide(angular2_jwt_1.AuthHttp, {
                    useFactory: function (http) {
                        return new angular2_jwt_1.AuthHttp(new angular2_jwt_1.AuthConfig, http);
                    },
                    deps: [http_1.Http],
                }),
                Usuario_1.Usuario,
            ],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.IonicApp, ionic_angular_1.Platform, Usuario_1.Usuario])
    ], NestoApp);
    return NestoApp;
}());
exports.NestoApp = NestoApp;