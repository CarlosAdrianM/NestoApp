﻿import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ExtractoCliente } from '../pages/ExtractoCliente/ExtractoCliente';
import { ListaPedidosVenta } from '../pages/ListaPedidosVenta/ListaPedidosVenta';
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
import { IonicStorageModule } from '@ionic/storage'
import { Storage } from '@ionic/storage'
import { Parametros } from '../services/Parametros.service';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { Http } from '@angular/http';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { LineaVentaComponent } from '../pages/LineaVenta/LineaVenta.component';
import { LineaVentaService } from '../pages/LineaVenta/LineaVenta.service';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';


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
    LineaVentaComponent
  ],
  imports: [
      IonicModule.forRoot(MyApp),
      CloudModule.forRoot(cloudSettings),
      IonicStorageModule.forRoot(),
      BrowserModule,
      FormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ExtractoCliente,
    ListaPedidosVenta,
    PedidoVentaComponent,
    PlantillaVenta,
    SelectorPlantillaVentaDetalle,
    ProfilePage,
    UltimasVentasProductoCliente,
    LineaVentaComponent
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
      SelectorVendedoresService,
      UltimasVentasProductoClienteService,
      Usuario,
      LineaVentaService,
  ]
})
export class AppModule {}
