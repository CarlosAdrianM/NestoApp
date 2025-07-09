import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, NavParams } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Usuario } from './models/Usuario';
import { FCM } from '@ionic-native/fcm/ngx';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { Storage } from '@ionic/storage'
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { FormsModule } from '@angular/forms';
import { ProductoComponent } from './components/producto/producto.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { ComisionesComponent } from './components/comisiones/comisiones.component';
import { SelectorVendedoresComponent } from './components/selector-vendedores/selector-vendedores.component';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { ClienteComponent } from './components/cliente/cliente.component';
import { SelectorFormasPagoComponent } from './components/selector-formas-pago/selector-formas-pago.component';
import { SelectorPlazosPagoComponent } from './components/selector-plazos-pago/selector-plazos-pago.component';
import { ClientesMismoTelefonoComponent } from './components/cliente/clientes-mismo-telefono';
import { SelectorAlmacenesComponent } from './components/selector-almacenes/selector-almacenes.component';
import { SelectorDireccionesEntregaComponent } from './components/selector-direcciones-entrega/selector-direcciones-entrega.component';
import { SelectorProductosComponent } from './components/selector-productos/selector-productos.component';
import { ComisionesDetalleComponent } from './components/comisiones-detalle/comisiones-detalle.component';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ExtractoClienteComponent } from './components/extracto-cliente/extracto-cliente.component';
import { SelectorClientesComponent } from './components/selector-clientes/selector-clientes.component';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { ListaRapportsComponent } from './components/lista-rapports/lista-rapports.component';
import { RapportComponent } from './components/rapport/rapport.component';
import { ListaPedidosVentaComponent } from './components/lista-pedidos-venta/lista-pedidos-venta.component';
import { PedidoVentaComponent } from './components/pedido-venta/pedido-venta.component';
import { LineaVentaComponent } from './components/linea-venta/linea-venta.component';
import { SelectorPlantillaVentaComponent } from './components/selector-plantilla-venta/selector-plantilla-venta.component';
import { SelectorPlantillaVentaDetalleComponent } from './components/selector-plantilla-venta-detalle/selector-plantilla-venta-detalle.component';
import { PlantillaVentaComponent } from './components/plantilla-venta/plantilla-venta.component';
import { UltimasVentasProductoClienteComponent } from './components/ultimas-ventas-producto-cliente/ultimas-ventas-producto-cliente.component';
import { CanDeactivateGuard } from './utils/can-deactivate-guard';
import { CacheModule } from "ionic-cache";
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { IPublicClientApplication,
         PublicClientApplication,
         BrowserCacheLocation } from '@azure/msal-browser';
import { MsalModule,
         MsalService,
         MSAL_INSTANCE } from '@azure/msal-angular';
import { OAuthSettings } from '../oauth';
import { AlertsComponent } from '../app/alerts/alerts.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ResumenVentasComponent } from './components/resumen-ventas/resumen-ventas.component';


registerLocaleData(localeEs);

let storage = new Storage({}, {});

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
    SelectorAlmacenesComponent,
    SelectorDireccionesEntregaComponent,
    SelectorProductosComponent,
    ComisionesDetalleComponent,
    ExtractoClienteComponent,
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
    UltimasVentasProductoClienteComponent,
    AlertsComponent,
    ResumenVentasComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    HttpClientModule,
    IonicStorageModule.forRoot(),
    CommonModule,
    FormsModule,
    NgxIonicImageViewerModule,
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
    InAppBrowser
    //FCM
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
