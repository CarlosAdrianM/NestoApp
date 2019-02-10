var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LOCALE_ID, NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { ListaRapports } from '../pages/ListaRapports/ListaRapports.component';
import { PedidoVentaComponent } from '../pages/PedidoVenta/PedidoVenta.component';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ProfilePage } from '../pages/profile/profile';
import { UltimasVentasProductoCliente } from '../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';
import { SelectorClientes } from '../components/SelectorClientes/SelectorClientes';
import { SelectorDireccionesEntrega } from '../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega';
import { SelectorFormasPago } from '../components/SelectorFormasPago/SelectorFormasPago';
import { SelectorPlantillaVenta } from '../components/SelectorPlantillaVenta/SelectorPlantillaVenta';
import { SelectorPlantillaVentaDetalle } from '../components/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle';
import { SelectorPlazosPago } from '../components/SelectorPlazosPago/SelectorPlazosPago';
import { SelectorVendedoresComponent } from '../components/SelectorVendedores/SelectorVendedores.component';
import { ExtractoClienteService } from '../pages/ExtractoCliente/ExtractoCliente.service';
import { ListaPedidosVentaService } from '../pages/ListaPedidosVenta/ListaPedidosVenta.service';
import { ListaRapportsService } from '../pages/ListaRapports/ListaRapports.service';
import { PedidoVentaService } from '../pages/PedidoVenta/PedidoVenta.service';
import { PlantillaVentaService } from '../pages/PlantillaVenta/PlantillaVenta.service';
import { UltimasVentasProductoClienteService } from '../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente.service';
import { SelectorClientesService } from '../components/SelectorClientes/SelectorClientes.service';
import { SelectorDireccionesEntregaService } from '../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega.service';
import { SelectorFormasPagoService } from '../components/SelectorFormasPago/SelectorFormasPago.service';
import { SelectorPlantillaVentaService } from '../components/SelectorPlantillaVenta/SelectorPlantillaVenta.service';
import { SelectorPlazosPagoService } from '../components/SelectorPlazosPago/SelectorPlazosPago.service';
import { SelectorVendedoresService } from '../components/SelectorVendedores/SelectorVendedores.service';
import { Usuario } from '../models/Usuario';
import { IonicStorageModule } from '@ionic/storage';
import { Storage } from '@ionic/storage';
import { Parametros } from '../services/Parametros.service';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http, HttpModule } from '@angular/http';
import { LineaVentaComponent } from '../pages/LineaVenta/LineaVenta.component';
import { LineaVentaService } from '../pages/LineaVenta/LineaVenta.service';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RapportComponent } from '../pages/Rapport/Rapport.component';
import { RapportService } from '../pages/Rapport/Rapport.service';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { FCM } from '@ionic-native/fcm';
import { ComisionesComponent } from '../pages/Comisiones/Comisiones.component';
import { ComisionesService } from '../pages/Comisiones/Comisiones.service';
import { ComisionesDetalleComponent } from '../pages/ComisionesDetalle/ComisionesDetalle.component';
import { ComisionesDetalleService } from '../pages/ComisionesDetalle/ComisionesDetalle.service';
import { ProductoComponent } from '../pages/Producto/Producto.component';
import { ProductoService } from '../pages/Producto/Producto.service';
import { SelectorProductosComponent } from '../components/SelectorProductos/SelectorProductos.component';
import { ListaProductosComponent } from '../pages/ListaProductos/ListaProductos.component';
import { SelectorProductosService } from '../components/SelectorProductos/SelectorProductos.service';
var storage = new Storage({});
export function getAuthHttp(http) {
    return new AuthHttp(new AuthConfig({
        //        headerPrefix: "PELU_ESTETICA",
        noJwtError: true,
        globalHeaders: [{ 'Accept': 'application/json' }],
        tokenGetter: (function () { return storage.get('id_token').then(function (id_token) { return id_token; }); }),
    }), http);
}
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp,
                ExtractoCliente,
                ListaPedidosVenta,
                ListaRapports,
                PedidoVentaComponent,
                PlantillaVenta,
                ProfilePage,
                UltimasVentasProductoCliente,
                SelectorClientes,
                SelectorDireccionesEntrega,
                SelectorFormasPago,
                SelectorPlantillaVenta,
                SelectorPlantillaVentaDetalle,
                SelectorPlazosPago,
                SelectorVendedoresComponent,
                LineaVentaComponent,
                RapportComponent,
                ComisionesComponent,
                ComisionesDetalleComponent,
                ProductoComponent,
                ListaProductosComponent,
                SelectorProductosComponent
            ],
            imports: [
                BrowserModule,
                HttpModule,
                IonicModule.forRoot(MyApp),
                IonicStorageModule.forRoot(),
                FormsModule
            ],
            bootstrap: [IonicApp],
            entryComponents: [
                MyApp,
                ExtractoCliente,
                ListaPedidosVenta,
                ListaRapports,
                PedidoVentaComponent,
                PlantillaVenta,
                SelectorPlantillaVentaDetalle,
                ProfilePage,
                UltimasVentasProductoCliente,
                LineaVentaComponent,
                RapportComponent,
                ComisionesComponent,
                ComisionesDetalleComponent,
                ProductoComponent,
                ListaProductosComponent,
                SelectorProductosComponent
            ],
            providers: [
                {
                    provide: AuthHttp,
                    useFactory: getAuthHttp,
                    deps: [Http],
                },
                StatusBar,
                SplashScreen,
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                { provide: LOCALE_ID, useValue: 'es-ES' },
                ExtractoClienteService,
                ListaPedidosVentaService,
                ListaRapportsService,
                Parametros,
                PedidoVentaService,
                PlantillaVentaService,
                SelectorClientesService,
                SelectorDireccionesEntregaService,
                SelectorFormasPagoService,
                SelectorPlantillaVentaService,
                SelectorPlazosPagoService,
                SelectorVendedoresService,
                UltimasVentasProductoClienteService,
                Usuario,
                LineaVentaService,
                RapportService,
                Keyboard,
                FCM,
                ComisionesService,
                ComisionesDetalleService,
                ProductoService,
                SelectorProductosService
            ]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map