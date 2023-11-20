import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { ProductoService } from './producto.service';


@Component({
  selector: 'producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit {
  public productoActual: string = "39813";
  public producto: any;
  public clientes: any;

  constructor(private servicio: ProductoService, 
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    private route: ActivatedRoute,
    private firebaseAnalytics: FirebaseAnalytics
    ) {
    if (this.route.snapshot.queryParams.producto) {
      this.productoActual = this.route.snapshot.queryParams.producto;
    }
  }

  ngOnInit() {
    this.cargar();
  };

  async cargar() {
    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Producto...',
    })

    await loading.present();
    this.servicio.cargar("1", this.productoActual, true)
      .subscribe(
        async data => {
          this.firebaseAnalytics.logEvent("producto_cargar", {producto: this.productoActual});
          if (data.length === 0) {
            let alert = await this.alertCtrl.create({
              message: 'Error',
              subHeader: 'No se ha cargado correctamente el producto',
              buttons: ['Ok'],
            });
            await alert.present();
          } else {
            this.clientes = null;
            this.producto = data;
          }
        },
        async error => {
          await loading.dismiss();
        },
        async () => {
          await loading.dismiss();
        }
      );
  }

  async cargarClientes() {
    let loading: any = await this.loadingCtrl.create({
      message: 'Cargando Clientes...',
    });
    await loading.present();
    this.servicio.cargarClientes("1", this.productoActual)
      .subscribe(
        async data => {
          this.firebaseAnalytics.logEvent("producto_ver_clientes", {producto: this.productoActual});
          if (data.length === 0) {
            let alert = await this.alertCtrl.create({
              message: 'Error',
              subHeader: 'Ningún cliente ha comprado el producto ' + this.productoActual,
              buttons: ['Ok'],
            });
            await alert.present();
          } else {
            this.clientes = data;
          }
        },
        async error => {
          await loading.dismiss();
        },
        async () => {
          await loading.dismiss();
        }
      );
  }

  public abrirEnlaceWeb(urlDestino: string): void {
      urlDestino += '&utm_medium=NestoApp_ficha_producto';
      this.firebaseAnalytics.logEvent("producto_abrir_enlace_web", {enlace: urlDestino});
      window.open(urlDestino, '_system', 'location=yes');
  }

  public seleccionarTexto(evento: any): void {
    var nativeInputEle = evento.target;
    nativeInputEle.getInputElement().then(
      a => a.select()
    )
  }
}
