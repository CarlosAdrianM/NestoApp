import { Component, OnInit } from '@angular/core';
import { ProductoService } from './Producto.service';
import { LoadingController, AlertController } from 'ionic-angular';

@Component({
  templateUrl: 'Producto.html',
})
export class ProductoComponent {
  public productoActual: string = "38651";
  public producto: any;

  constructor(private servicio: ProductoService, 
    public loadingCtrl: LoadingController, public alertCtrl: AlertController) { }

  ngOnInit() {
    this.cargar();
  };

  cargar() {
    let loading: any = this.loadingCtrl.create({
      content: 'Cargando Comisiones...',
    });
    loading.present();
    this.servicio.cargar("1", this.productoActual, true)
      .subscribe(
        data => {
          if (data.length === 0) {
            let alert = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'No se ha cargado correctamente el producto',
              buttons: ['Ok'],
            });
            alert.present();
          } else {
            this.producto = data;
          }
        },
        error => {
          loading.dismiss();
        },
        () => {
          loading.dismiss();
        }
      );
  }

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento._native.nativeElement;
    nativeInputEle.select();
  }
}
