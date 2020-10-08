import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorAlmacenesService } from './selector-almacenes.service';

@Component({
  selector: 'selector-almacenes',
  templateUrl: './selector-almacenes.component.html',
  styleUrls: ['./selector-almacenes.component.scss'],
})
export class SelectorAlmacenesComponent extends SelectorBase implements OnInit {
  @Input() public cliente: any;
  @Input() public seleccionado: any;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;
  private servicio: SelectorAlmacenesService;

  constructor(servicio: SelectorAlmacenesService, alertCtrl: AlertController, loadingCtrl: LoadingController) {
      super();
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      this.servicio = servicio;
  }

  ngOnInit() {
      this.cargarDatos();
  }

  public cargarDatos(): void {
      this.servicio.getAlmacenes(this.cliente).subscribe(
          async data => {
              if (data.length === 0) {
                  let alert: any = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'Error al cargar los almacenes',
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
}
