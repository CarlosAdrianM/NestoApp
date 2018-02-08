import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesDetalleService } from './ComisionesDetalle.service';
import { PedidoVentaComponent } from '../PedidoVenta/PedidoVenta.component';

@Component({
  templateUrl: 'ComisionesDetalle.html',
})
export class ComisionesDetalleComponent {
  public listaDetalleComision: any;

  constructor(private servicio: ComisionesDetalleService, private nav: NavController,
    private navParams: NavParams, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {
    this.cargarDetalle(navParams.get('vendedor'), navParams.get('anno'),
      navParams.get('mes'), navParams.get('incluirAlbaranes'), navParams.get('etiqueta'));
  }

  private cargarDetalle(vendedor: string, anno: number, mes: number,
    incluirAlbaranes: boolean, etiqueta: string) {
    let loading: any = this.loadingCtrl.create({
      content: 'Cargando Comisiones...',
    });
    loading.present();
    this.servicio.cargarDetalle(vendedor, anno, mes, incluirAlbaranes, etiqueta)
      .subscribe(
          data => {
            if (data.length === 0) {
              let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'No se han cargado correctamente las comisiones',
                buttons: ['Ok'],
              });
              alert.present();
            } else {
              this.listaDetalleComision = data;
            }
          },
          error => {
            loading.dismiss();
          },
          () => {
            loading.dismiss();
          }
    )
  }

  public abrirPedido(detalle: any): void {
    this.nav.push(PedidoVentaComponent, { empresa: detalle.Empresa, numero: detalle.Pedido });
  }
}
