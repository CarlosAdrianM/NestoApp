import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
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
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

let storage = new Storage();

export function getAuthHttp(http) {
    return new AuthHttp(new AuthConfig({
//        headerPrefix: "PELU_ESTETICA",
        noJwtError: true,
        globalHeaders: [{ 'Accept': 'application/json' }],
        tokenGetter: (() => storage.get('id_token')),
    }), http);
}

const cloudSettings: CloudSettings = {
    'core': {
        'app_id': '0eb19c2c'
    }
};

@NgModule({
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
      {provide: ErrorHandler, useClass: IonicErrorHandler},
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
})
export class AppModule {}
