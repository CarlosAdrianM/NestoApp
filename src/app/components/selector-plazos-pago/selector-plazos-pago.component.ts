import { Component, Input, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorPlazosPagoService } from './selector-plazos-pago.service';

@Component({
  selector: 'selector-plazos-pago',
  templateUrl: './selector-plazos-pago.component.html',
  styleUrls: ['./selector-plazos-pago.component.scss'],
})
export class SelectorPlazosPagoComponent extends SelectorBase implements OnInit {
  @Input() public seleccionado: any;
  @Input() public cliente: any;
  private nav: NavController;
  private servicio: SelectorPlazosPagoService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;

  constructor(servicio: SelectorPlazosPagoService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
      super();
      this.nav = nav;
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
  }

  ngOnInit() {
      this.cargarDatos();
  }

  public cargarDatos(): void {
      this.servicio.getPlazosPago(this.cliente).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'Error al cargar los plazos de pago',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                  this.inicializarDatos(data);
              }
          },
          error => {
              // loading.dismiss();
              this.errorMessage = <any>error;
          },
          () => {
              // loading.dismiss();
          }
      );
  }

  obtenerPlazo(event: any) {
    const indice = event.detail.value;
    const plazo = this.datosFiltrados.find((p, plazoPago) => p.plazoPago === indice);
    this.seleccionarDato(plazo);
  }    
}
