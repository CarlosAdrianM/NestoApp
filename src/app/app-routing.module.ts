import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ClienteComponent } from './components/cliente/cliente.component';
import { ComisionesDetalleComponent } from './components/comisiones-detalle/comisiones-detalle.component';
import { ComisionesComponent } from './components/comisiones/comisiones.component';
import { ExtractoClienteComponent } from './components/extracto-cliente/extracto-cliente.component';
import { LineaVentaComponent } from './components/linea-venta/linea-venta.component';
import { ListaPedidosVentaComponent } from './components/lista-pedidos-venta/lista-pedidos-venta.component';
import { ListaProductosComponent } from './components/lista-productos/lista-productos.component';
import { ListaRapportsComponent } from './components/lista-rapports/lista-rapports.component';
import { PedidoVentaComponent } from './components/pedido-venta/pedido-venta.component';
import { PlantillaVentaComponent } from './components/plantilla-venta/plantilla-venta.component';
import { PlantillaVentaService } from './components/plantilla-venta/plantilla-venta.service';
import { ProductoComponent } from './components/producto/producto.component';
import { ProfileComponent } from './components/profile/profile/profile.component';
import { RapportComponent } from './components/rapport/rapport.component';
import { SelectorPlantillaVentaDetalleComponent } from './components/selector-plantilla-venta-detalle/selector-plantilla-venta-detalle.component';
import { UltimasVentasProductoClienteComponent } from './components/ultimas-ventas-producto-cliente/ultimas-ventas-producto-cliente.component';
import { CanDeactivateGuard } from './utils/can-deactivate-guard';

const routes: Routes = [
  {
    path: 'profile',
    component : ProfileComponent
  },
  {
    path: 'producto',
    component: ProductoComponent
  },
  {
    path: 'comisiones',
    component: ComisionesComponent
  },
  {
    path: 'comisiones-detalle',
    component: ComisionesDetalleComponent
  },
  {
    path: 'cliente',
    component: ClienteComponent
  },
  {
    path: 'extracto-cliente',
    component: ExtractoClienteComponent
  },  
  {
    path: 'lista-productos',
    component: ListaProductosComponent
  },
  {
    path: 'rapport',
    component: RapportComponent
  },
  {
    path: 'lista-rapports',
    component: ListaRapportsComponent
  },
  {
    path: 'pedido-venta',
    component: PedidoVentaComponent
  },
  {
    path: 'lista-pedidos-venta',
    component: ListaPedidosVentaComponent
  },
  {
    path: 'linea-venta',
    component: LineaVentaComponent
  },
  {
    path: 'plantilla-venta',
    component: PlantillaVentaComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: 'selector-plantilla-venta-detalle',
    component: SelectorPlantillaVentaDetalleComponent
  },
  {
    path: 'ultimas-ventas-producto-cliente',
    component: UltimasVentasProductoClienteComponent
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
