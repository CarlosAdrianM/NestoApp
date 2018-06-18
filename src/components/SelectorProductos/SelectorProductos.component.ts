import { Injectable, Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { SelectorBase } from "../SelectorBase/SelectorBase";
import { LoadingController, AlertController, NavController } from "ionic-angular";
import { SelectorProductosService } from "./SelectorProductos.service";
import { Keyboard } from '@ionic-native/keyboard';
import { ProductoComponent } from "../../pages/Producto/Producto.component";

@Component({
  selector: 'selector-productos',
  templateUrl: 'SelectorProductos.html'
})
@Injectable()
export class SelectorProductosComponent extends SelectorBase {
  @Output() seleccionar = new EventEmitter();

  public filtroNombre: string;
  public filtroFamilia: string;
  public filtroSubgrupo: string;

  constructor(private servicio: SelectorProductosService, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private keyboard: Keyboard, private nav: NavController) {
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

  protected cargarDatos(filtro: string): void {
    /*
    let filtros: string[];
    filtros.push(this.filtroNombre);
    filtros.push(this.filtroFamilia);
    filtros.push(this.filtroSubgrupo);
    */

    let loading: any = this.loadingCtrl.create({
      content: 'Cargando Productos...',
    });

    loading.present();

    this.servicio.getProductos(filtro).subscribe(
      data => {
        if (data.length === 0) {
          let alert: any = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'No se encuentra ningún producto con esos filtros',
            buttons: ['Ok'],
          });
          alert.present();
        } else {
          this.inicializarDatos(data);
        }
        loading.dismiss();
      },
      error => {
        // loading.dismiss();
        this.errorMessage = <any>error;
        loading.dismiss();
      },
      () => {

      }
    );
  }

  public abrirFichaProducto(producto: any): void {
    this.nav.push(ProductoComponent, { empresa: "1", producto: producto.producto });
  }
}
