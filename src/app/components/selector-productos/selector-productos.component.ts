import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorProductosService } from './selector-productos.service';

@Component({
    selector: 'selector-productos',
    templateUrl: './selector-productos.component.html',
    styleUrls: ['./selector-productos.component.scss'],
    standalone: false
})
export class SelectorProductosComponent extends SelectorBase implements OnDestroy {
  @Output() seleccionar = new EventEmitter();

  public filtroNombre: string;
  public filtroFamilia: string;
  public filtroSubgrupo: string;
  private loadingActivo: HTMLIonLoadingElement | null = null;

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

  ngOnDestroy() {
    if (this.loadingActivo) {
      this.loadingActivo.dismiss().catch(() => {});
      this.loadingActivo = null;
    }
  }

  public setFocus(): void {
    setTimeout(() => {
      this.myIonSearchBar.setFocus();
      this.keyboard.show();
    }, 0);
  }

  protected async cargarDatos(filtro: string): Promise<void> {
    let loading = await this.loadingCtrl.create({
      message: 'Cargando Productos...',
    });
    this.loadingActivo = loading;

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
        await loading.dismiss();
        this.loadingActivo = null;
      },
      async error => {
        this.errorMessage = <any>error;
        await loading.dismiss();
        this.loadingActivo = null;
      }
    );
  }

  public abrirFichaProducto(producto: any): void {
    this.nav.navigateForward("/producto", { queryParams: { empresa: "1", producto: producto.producto }});
  }
}
