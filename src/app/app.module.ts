import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, NavParams } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Usuario } from './models/Usuario';
import { FCM } from '@awesome-cordova-plugins/fcm/ngx';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Storage } from '@ionic/storage-angular'
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { FormsModule } from '@angular/forms';
import { ProductoComponent } from './components/producto/producto.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ComisionesComponent } from './components/comisiones/comisiones.component';
import { SelectorVendedoresComponent } from './components/selector-vendedores/selector-vendedores.component';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { ClienteComponent } from './components/cliente/cliente.component';
import { SelectorFormasPagoComponent } from './components/selector-formas-pago/selector-formas-pago.component';
import { SelectorPlazosPagoComponent } from './components/selector-plazos-pago/selector-plazos-pago.component';
import { SelectorCCCComponent } from './components/selector-ccc/selector-ccc.component';
import { ClientesMismoTelefonoComponent } from './components/cliente/clientes-mismo-telefono';
import { SelectorAlmacenesComponent } from './components/selector-almacenes/selector-almacenes.component';
import { SelectorDireccionesEntregaComponent } from './components/selector-direcciones-entrega/selector-direcciones-entrega.component';
import { SelectorProductosComponent } from './components/selector-productos/selector-productos.component';
import { ComisionesDetalleComponent } from './components/comisiones-detalle/comisiones-detalle.component';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { ExtractoClienteComponent, ModalEnviarEnlaceCobroComponent } from './components/extracto-cliente/extracto-cliente.component';
import { SelectorClientesComponent } from './components/selector-clientes/selector-clientes.component';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { ListaRapportsComponent } from './components/lista-rapports/lista-rapports.component';
import { RapportComponent } from './components/rapport/rapport.component';
import { ListaPedidosVentaComponent } from './components/lista-pedidos-venta/lista-pedidos-venta.component';
import { PedidoVentaComponent } from './components/pedido-venta/pedido-venta.component';
import { LineaVentaComponent } from './components/linea-venta/linea-venta.component';
import { SelectorPlantillaVentaComponent } from './components/selector-plantilla-venta/selector-plantilla-venta.component';
import { SelectorPlantillaVentaDetalleComponent } from './components/selector-plantilla-venta-detalle/selector-plantilla-venta-detalle.component';
import { PlantillaVentaComponent } from './components/plantilla-venta/plantilla-venta.component';
import { ModalListaBorradoresComponent } from './components/plantilla-venta/modal-lista-borradores.component';
import { SelectorRegalosComponent } from './components/selector-regalos/selector-regalos.component';
import { ModalResumenVentasComponent } from './components/resumen-ventas/modal-resumen-ventas.component';
import { UltimasVentasProductoClienteComponent } from './components/ultimas-ventas-producto-cliente/ultimas-ventas-producto-cliente.component';
import { CanDeactivateGuard } from './utils/can-deactivate-guard';
import { CacheModule } from "./services/cache.service";
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { IPublicClientApplication,
         PublicClientApplication,
         BrowserCacheLocation } from '@azure/msal-browser';
import { MsalModule,
         MsalService,
         MSAL_INSTANCE } from '@azure/msal-angular';
import { OAuthSettings } from '../oauth';
import { AlertsComponent } from '../app/alerts/alerts.component';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ResumenVentasComponent } from './components/resumen-ventas/resumen-ventas.component';


registerLocaleData(localeEs);

let storage = new Storage();

export function initializeStorage(storage: Storage) {
  return () => storage.create();
}

let msalInstance: IPublicClientApplication | undefined = undefined;

export function MSALInstanceFactory(): IPublicClientApplication {
  msalInstance = msalInstance ?? new PublicClientApplication({
    auth: {
      clientId: OAuthSettings.appId,
      redirectUri: OAuthSettings.redirectUri,
      postLogoutRedirectUri: OAuthSettings.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  });

  return msalInstance;
}


@NgModule({
    declarations: [
        AppComponent,
        ProfileComponent,
        ProductoComponent,
        ComisionesComponent,
        SelectorVendedoresComponent,
        ClienteComponent,
        ClientesMismoTelefonoComponent,
        SelectorFormasPagoComponent,
        SelectorPlazosPagoComponent,
        SelectorCCCComponent,
        SelectorAlmacenesComponent,
        SelectorDireccionesEntregaComponent,
        SelectorProductosComponent,
        ComisionesDetalleComponent,
        ExtractoClienteComponent,
        ModalEnviarEnlaceCobroComponent,
        SelectorClientesComponent,
        ListaProductosComponent,
        ListaRapportsComponent,
        RapportComponent,
        ListaPedidosVentaComponent,
        PedidoVentaComponent,
        LineaVentaComponent,
        SelectorPlantillaVentaComponent,
        SelectorPlantillaVentaDetalleComponent,
        PlantillaVentaComponent,
        ModalListaBorradoresComponent,
        UltimasVentasProductoClienteComponent,
        AlertsComponent,
        ResumenVentasComponent,
        SelectorRegalosComponent,
        ModalResumenVentasComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
        AppRoutingModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        CommonModule,
        FormsModule,
        CacheModule.forRoot({ keyPrefix: 'NestoApp' }),
        MsalModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: LOCALE_ID, useValue: 'es' },
        Usuario,
        JwtHelperService,
        Geolocation,
        NativeGeocoder,
        NavParams,
        FileTransfer,
        File,
        FileOpener,
        Keyboard,
        CanDeactivateGuard,
        FirebaseAnalytics,
        AppVersion,
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
        },
        MsalService,
        InAppBrowser,
        HTTP,
        FCM,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeStorage,
            deps: [Storage],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
