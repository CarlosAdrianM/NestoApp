import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorProductosService } from './selector-productos.service';

@Component({
  selector: 'selector-productos',
  templateUrl: './selector-productos.component.html',
  styleUrls: ['./selector-productos.component.scss'],
})
export class SelectorProductosComponent extends SelectorBase {
  @Output() seleccionar = new EventEmitter();

  public filtroNombre: string;
  public filtroFamilia: string;
  public filtroSubgrupo: string;

  constructor(
    private servicio: SelectorProductosService, 
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, 
    private keyboard: Keyboard, 
    private nav: NavController,
    ) {
    super();
  }

  @ViewChild('barra') myIonSearchBar;

  ngAfterViewInit() {
    this.setFocus();
  }


  public setFocus(): void {
    setTimeout(() => {
      this.myIonSearchBar.setFocus();
      this.keyboard.show();
    }, 0);
  }

  protected async cargarDatos(filtro: string): Promise<void> {
    /*
    let filtros: string[];
    filtros.push(this.filtroNombre);
    filtros.push(this.filtroFamilia);
    filtros.push(this.filtroSubgrupo);
    */

    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Productos...',
    });

    await loading.present();

    this.servicio.getProductos(filtro).subscribe(
      async data => {
        if (data.length === 0) {
          let alert: any = await this.alertCtrl.create({
            message: 'Error',
            subHeader: 'No se encuentra ningún producto con esos filtros',
            buttons: ['Ok'],
          });
          await alert.present();
        } else {
          this.inicializarDatos(data);
        }
        loading.dismiss();
      },
      async error => {
        // loading.dismiss();
        this.errorMessage = <any>error;
        await loading.dismiss();
      },
      () => {

      }
    );
  }

  public abrirFichaProducto(producto: any): void {
    this.nav.navigateForward("/producto", { queryParams: { empresa: "1", producto: producto.producto }});
  }
}
