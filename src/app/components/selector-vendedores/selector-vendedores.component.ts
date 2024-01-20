import { Component, Injectable, Input, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorVendedoresService } from './selector-vendedores.service';

@Component({
  selector: 'selector-vendedores',
  templateUrl: './selector-vendedores.component.html',
  styleUrls: ['./selector-vendedores.component.scss'],
  outputs: ['seleccionar'],
})
@Injectable()
export class SelectorVendedoresComponent extends SelectorBase implements OnInit {

  @Input() public seleccionado: any;
  @Input() public etiqueta: any;
  @Input() public ocultarConVendedorUnico: boolean;
  private nav: NavController;
  private servicio: SelectorVendedoresService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;

  constructor(servicio: SelectorVendedoresService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
      super();
      this.nav = nav;
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
  }

  ngOnInit() {
      this.cargarDatos();
  }

  public mostrar(): boolean {
    return !this.ocultarConVendedorUnico || this.numeroDeDatos() > 1;
  }

  public cargarDatos(): void {
      this.servicio.getVendedores().subscribe(
          async data => {
              if (data.length === 0) {
                  let alert = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'Error al cargar vendedores',
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
