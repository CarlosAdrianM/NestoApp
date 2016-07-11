'use strict';

import { Component, Type, provide, ViewChild }           from '@angular/core';
import { ionicBootstrap, Platform, Nav, MenuController, Alert } from 'ionic-angular';
import {Http}      from '@angular/http';
import {Deploy, CloudSettings, provideCloud} from '@ionic/cloud-angular';
import {AuthHttp, AuthConfig}      from 'angular2-jwt';
import {Usuario}                   from './models/Usuario';
import { ProfilePage }             from './pages/profile/profile';
import { ExtractoCliente }         from './pages/ExtractoCliente/ExtractoCliente';
import { PlantillaVenta }          from './pages/PlantillaVenta/PlantillaVenta';
import { ListaPedidosVenta }       from './pages/ListaPedidosVenta/ListaPedidosVenta';

const cloudSettings: CloudSettings = {
    'core': {
        'app_id': '0eb19c2c'
    }
};

@Component({
  templateUrl: 'build/app.html'
})
export class NestoApp {
  @ViewChild(Nav) private nav: Nav;
  private rootPage: Type;
  private pages: Array<{title: string, component: Type}>;
  // private app: IonicApp;
  private platform: Platform;
  private usuario: Usuario;
  private menu: MenuController;

  constructor(platform: Platform, usuario: Usuario, menu: MenuController, public deploy: Deploy) {
    // this.app = app;
    this.platform = platform;
    this.usuario = usuario;
    this.menu = menu;

    this.initializeApp(deploy);

    // set our app's pages
    this.pages = [
        { title: 'Plantilla Venta', component: PlantillaVenta },
        { title: 'Pedidos Venta', component: ListaPedidosVenta},
        { title: 'Extracto Cliente', component: ExtractoCliente },
        { title: 'Usuario', component: ProfilePage },
    ];

    this.rootPage = PlantillaVenta;

  }

  private initializeApp(deploy): void {
    this.platform.ready().then(() => {
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

        deploy.setChannel("Production");

        deploy.info().then(function (deployInfo) {
            console.log(deployInfo);
        }, function () { }, function () { });

        deploy.getVersions().then(function (versions) {
            console.log(versions);
        });

        console.log('Ionic Deploy: Checking for updates for channel : Production');

        return deploy.check().then(function (response) {
            // response will be true/false
            if (response) {
                deploy.update().then(function (res) {
                    let alert: Alert = Alert.create({
                        title: 'Actualización',
                        subTitle: 'Aplicación actualizada a la última versión',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                }, function (err) {
                    let alert: Alert = Alert.create({
                        title: 'Actualización',
                        subTitle: 'Se ha producido un error al actualizar la aplicación',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                }, function (prog) {
                    console.log('Ionic Deploy: Progress... ', prog);
                });
            }
        }, function (err) {
            console.error('Ionic Deploy: Unable to check for updates', err);
        });

      });
  }

  public openPage(page: any): void {
    /*
    // close the menu when clicking a link from the menu
    this.app.getComponent('leftMenu').close();
    // navigate to the new page if it is not the current page
    this.app.getComponent('nav').setRoot(page.component);
      */
    this.menu.close();
    this.nav.setRoot(page.component);
  };
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(
    NestoApp,
    [
        provide(
            AuthHttp, {
                useFactory: (http: any): AuthHttp => {
                    return new AuthHttp(new AuthConfig, http);
                },
                deps: [Http],
            }
        ),
        Usuario,
        provideCloud(cloudSettings),
    ],
    {}
);
