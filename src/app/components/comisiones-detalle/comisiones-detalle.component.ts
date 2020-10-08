import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { ComisionesDetalleService } from './comisiones-detalle.service';

@Component({
  selector: 'comisiones-detalle',
  templateUrl: './comisiones-detalle.component.html',
  styleUrls: ['./comisiones-detalle.component.scss'],
})
export class ComisionesDetalleComponent {
  public listaDetalleComision: any;

  constructor(
    private servicio: ComisionesDetalleService, 
    private nav: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, 
    private route: ActivatedRoute
    ) {
      
    this.cargarDetalle(this.route.snapshot.queryParams.vendedor,
      this.route.snapshot.queryParams.anno,
      this.route.snapshot.queryParams.mes, 
      this.route.snapshot.queryParams.incluirAlbaranes, 
      this.route.snapshot.queryParams.etiqueta);
  }

  private async cargarDetalle(vendedor: string, anno: number, mes: number,
    incluirAlbaranes: boolean, etiqueta: string) {
    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Comisiones...',
    });
    await loading.present();
    this.servicio.cargarDetalle(vendedor, anno, mes, incluirAlbaranes, etiqueta)
      .subscribe(
          async data => {
            if (data.length === 0) {
              let alert = await this.alertCtrl.create({
                message: 'Error',
                subHeader: 'No se han cargado correctamente las comisiones',
                buttons: ['Ok'],
              });
              await alert.present();
            } else {
              this.listaDetalleComision = data;
            }
          },
          async error => {
            await loading.dismiss();
          },
          async () => {
            await loading.dismiss();
          }
    )
  }

  public abrirPedido(detalle: any): void {
    this.nav.navigateForward('/pedido',{ queryParams : { empresa: detalle.Empresa, numero: detalle.Pedido }});
  }
}
