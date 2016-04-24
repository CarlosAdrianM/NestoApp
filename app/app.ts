'use strict';

import { Type, provide }           from 'angular2/core';
import { App, IonicApp, Platform } from 'ionic-angular';
import {Http}                      from 'angular2/http';
import {AuthHttp, AuthConfig}      from 'angular2-jwt';
import {Usuario}                   from './models/Usuario';
import { ProfilePage }             from './pages/profile/profile';
import { ExtractoCliente }         from './pages/ExtractoCliente/ExtractoCliente';
import { PlantillaVenta }          from './pages/PlantillaVenta/PlantillaVenta';

@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [
      provide(AuthHttp, {
          useFactory: (http: Http): AuthHttp => {
              return new AuthHttp(new AuthConfig, http);
          },
          deps: [Http],
      }),
      Usuario,
  ],
})
export class NestoApp {

  private rootPage: Type;
  private pages: Array<{title: string, component: Type}>;
  private app: IonicApp;
  private platform: Platform;
  private usuario: Usuario;

  constructor(app: IonicApp, platform: Platform, usuario: Usuario) {
    this.app = app;
    this.platform = platform;
    this.usuario = usuario;

    this.rootPage = PlantillaVenta;
    this.initializeApp();

    // set our app's pages
    this.pages = [
        { title: 'Plantilla Venta', component: PlantillaVenta },
        { title: 'Extracto Cliente', component: ExtractoCliente },
        { title: 'Usuario', component: ProfilePage },
    ];
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
    // close the menu when clicking a link from the menu
    this.app.getComponent('leftMenu').close();
    // navigate to the new page if it is not the current page
    this.app.getComponent('nav').setRoot(page.component);
  };
}
