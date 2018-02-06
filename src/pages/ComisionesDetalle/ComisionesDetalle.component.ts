import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesDetalleService } from './ComisionesDetalle.service';
import { PedidoVentaComponent } from '../PedidoVenta/PedidoVenta.component';

@Component({
  templateUrl: 'ComisionesDetalle.html',
})
export class ComisionesDetalleComponent {
  public listaDetalleComision: any;

  constructor(private servicio: ComisionesDetalleService, private nav: NavController, private navParams: NavParams) {
    this.cargarDetalle(navParams.get('tipoDetalle'), navParams.get('anno'),
      navParams.get('mes'), navParams.get('incluirAlbaranes'));
  }

  private cargarDetalle(tipoDetalle: string, anno: number, mes: number,
    incluirAlbaranes: boolean) {
    this.listaDetalleComision = this.servicio.cargarDetalle(tipoDetalle, anno, mes, incluirAlbaranes);
  }

  public abrirPedido(detalle: any): void {
    this.nav.push(PedidoVentaComponent, { empresa: detalle.Empresa, numero: detalle.Pedido });
  }
}
