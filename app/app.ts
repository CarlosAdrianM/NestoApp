'use strict';

import { Type, provide, ViewChild }           from '@angular/core';
import { App, Platform, Nav, MenuController } from 'ionic-angular';
import {Http}      from '@angular/http';
import {AuthHttp, AuthConfig}      from 'angular2-jwt';
import {Usuario}                   from './models/Usuario';
import { ProfilePage }             from './pages/profile/profile';
import { ExtractoCliente }         from './pages/ExtractoCliente/ExtractoCliente';
import { PlantillaVenta }          from './pages/PlantillaVenta/PlantillaVenta';
import { ListaPedidosVenta }       from './pages/ListaPedidosVenta/ListaPedidosVenta';

@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [
      provide(AuthHttp, {
          useFactory: (http: any): AuthHttp => {
              return new AuthHttp(new AuthConfig, http);
          },
          deps: [Http],
      }),
      Usuario,
  ],
})
export class NestoApp {
  @ViewChild(Nav) private nav: Nav;
  private rootPage: Type;
  private pages: Array<{title: string, component: Type}>;
  // private app: IonicApp;
  private platform: Platform;
  private usuario: Usuario;
  private menu: MenuController;

  constructor(platform: Platform, usuario: Usuario, menu: MenuController) {
    // this.app = app;
    this.platform = platform;
    this.usuario = usuario;
    this.menu = menu;

    this.initializeApp();

    // set our app's pages
    this.pages = [
        { title: 'Plantilla Venta', component: PlantillaVenta },
        { title: 'Pedidos Venta', component: ListaPedidosVenta},
        { title: 'Extracto Cliente', component: ExtractoCliente },
        { title: 'Usuario', component: ProfilePage },
    ];

    this.rootPage = PlantillaVenta;

  }

  private initializeApp(): void {
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
