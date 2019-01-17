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
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ListaRapports } from '../pages/ListaRapports/ListaRapports.component';
import { ProfilePage } from '../pages/profile/profile';
import { Usuario } from '../models/Usuario';
import { FCM } from '@ionic-native/fcm';
import { PedidoVentaComponent } from '../pages/PedidoVenta/PedidoVenta.component';
import { ComisionesComponent } from '../pages/Comisiones/Comisiones.component';
import { ListaProductosComponent } from '../pages/ListaProductos/ListaProductos.component';
var MyApp = /** @class */ (function () {
    function MyApp(platform, usuario, statusBar, alertCtrl, fcm) {
        this.platform = platform;
        this.usuario = usuario;
        this.statusBar = statusBar;
        this.alertCtrl = alertCtrl;
        this.fcm = fcm;
        this.rootPage = PlantillaVenta;
        this.initializeApp();
        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Plantilla Venta', component: PlantillaVenta },
            { title: 'Pedidos Venta', component: ListaPedidosVenta },
            { title: 'Extracto Cliente', component: ExtractoCliente },
            { title: 'Rapports', component: ListaRapports },
            { title: 'Comisiones', component: ComisionesComponent },
            { title: 'Productos', component: ListaProductosComponent },
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
            _this.statusBar.styleDefault();
            _this.fcm.onTokenRefresh().subscribe(function (token) {
                alert('token refreshed: ' + token);
            });
            _this.fcm.subscribeToTopic(_this.usuario.nombre);
            _this.fcm.getToken().then(function (token) {
                // backend.registerToken(token);
            });
            _this.fcm.onNotification().subscribe(function (data) {
                if (data.wasTapped) {
                    _this.nav.push(PedidoVentaComponent, { empresa: data.empresa, numero: data.numero });
                }
                else {
                    var alert_1 = _this.alertCtrl.create({
                        title: 'Nuevo Pedido ' + data.numero,
                        message: '¿Quieres verlo ahora?',
                        buttons: [
                            {
                                text: 'No',
                                role: 'cancel',
                                handler: function () {
                                    return;
                                },
                            },
                            {
                                text: 'Sí',
                                handler: function () {
                                    _this.nav.push(PedidoVentaComponent, { empresa: data.empresa, numero: data.numero });
                                },
                            },
                        ],
                    });
                    alert_1.present();
                }
                ;
            });
            //this.fcm.unsubscribeFromTopic('marketing');
        });
    };
    MyApp.prototype.openPage = function (page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    };
    __decorate([
        ViewChild(Nav),
        __metadata("design:type", Nav)
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Component({
            templateUrl: 'app.html',
        }),
        __metadata("design:paramtypes", [Platform, Usuario, StatusBar, AlertController, FCM])
    ], MyApp);
    return MyApp;
}());
export { MyApp };
//# sourceMappingURL=app.component.js.map