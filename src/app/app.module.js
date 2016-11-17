var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
import { PedidoVenta } from '../pages/PedidoVenta/PedidoVenta';
import { PlantillaVenta } from '../pages/PlantillaVenta/PlantillaVenta';
import { ProfilePage } from '../pages/profile/profile';
import { UltimasVentasProductoCliente } from '../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente';
import { SelectorClientes } from '../components/SelectorClientes/SelectorClientes';
import { SelectorDireccionesEntrega } from '../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega';
import { SelectorFormasPago } from '../components/SelectorFormasPago/SelectorFormasPago';
import { SelectorPlantillaVenta } from '../components/SelectorPlantillaVenta/SelectorPlantillaVenta';
import { SelectorPlantillaVentaDetalle } from '../components/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle';
import { SelectorPlazosPago } from '../components/SelectorPlazosPago/SelectorPlazosPago';
import { ExtractoClienteService } from '../pages/ExtractoCliente/ExtractoCliente.service';
import { ListaPedidosVentaService } from '../pages/ListaPedidosVenta/ListaPedidosVenta.service';
import { PedidoVentaService } from '../pages/PedidoVenta/PedidoVenta.service';
import { PlantillaVentaService } from '../pages/PlantillaVenta/PlantillaVenta.service';
import { UltimasVentasProductoClienteService } from '../pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente.service';
import { SelectorClientesService } from '../components/SelectorClientes/SelectorClientes.service';
import { SelectorDireccionesEntregaService } from '../components/SelectorDireccionesEntrega/SelectorDireccionesEntrega.service';
import { SelectorFormasPagoService } from '../components/SelectorFormasPago/SelectorFormasPago.service';
import { SelectorPlantillaVentaService } from '../components/SelectorPlantillaVenta/SelectorPlantillaVenta.service';
import { SelectorPlazosPagoService } from '../components/SelectorPlazosPago/SelectorPlazosPago.service';
import { Usuario } from '../models/Usuario';
import { Storage } from '@ionic/storage';
import { Parametros } from '../services/Parametros.service';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http } from '@angular/http';
import { CloudModule } from '@ionic/cloud-angular';
var storage = new Storage();
export function getAuthHttp(http) {
    return new AuthHttp(new AuthConfig({
        //        headerPrefix: "PELU_ESTETICA",
        noJwtError: true,
        globalHeaders: [{ 'Accept': 'application/json' }],
        tokenGetter: (function () { return storage.get('id_token'); }),
    }), http);
}
var cloudSettings = {
    'core': {
        'app_id': '0eb19c2c'
    }
};
export var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp,
                ExtractoCliente,
                ListaPedidosVenta,
                PedidoVenta,
                PlantillaVenta,
                ProfilePage,
                UltimasVentasProductoCliente,
                SelectorClientes,
                SelectorDireccionesEntrega,
                SelectorFormasPago,
                SelectorPlantillaVenta,
                SelectorPlantillaVentaDetalle,
                SelectorPlazosPago
            ],
            imports: [
                IonicModule.forRoot(MyApp),
                CloudModule.forRoot(cloudSettings)
            ],
            bootstrap: [IonicApp],
            entryComponents: [
                MyApp,
                ExtractoCliente,
                ListaPedidosVenta,
                PedidoVenta,
                PlantillaVenta,
                SelectorPlantillaVentaDetalle,
                ProfilePage,
                UltimasVentasProductoCliente
            ],
            providers: [
                {
                    provide: AuthHttp,
                    useFactory: getAuthHttp,
                    deps: [Http],
                },
                ExtractoClienteService,
                ListaPedidosVentaService,
                Parametros,
                PedidoVentaService,
                PlantillaVentaService,
                SelectorClientesService,
                SelectorDireccionesEntregaService,
                SelectorFormasPagoService,
                SelectorPlantillaVentaService,
                SelectorPlazosPagoService,
                Storage,
                UltimasVentasProductoClienteService,
                Usuario
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
//# sourceMappingURL=app.module.js.map