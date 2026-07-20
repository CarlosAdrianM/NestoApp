import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ProductoService } from './producto.service';
import { VisorImagenComponent } from '../visor-imagen/visor-imagen.component';


@Component({
    selector: 'producto',
    templateUrl: './producto.component.html',
    styleUrls: ['./producto.component.scss'],
    standalone: false
})
export class ProductoComponent implements OnInit, OnDestroy {
  public productoActual: string = "39813";
  public producto: any;
  public clientes: any;
  public videos: any[] = [];
  public vistaSeleccionada: string = "info";
  private loadingActivo: HTMLIonLoadingElement | null = null;


  constructor(private servicio: ProductoService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private route: ActivatedRoute,
    private firebaseAnalytics: FirebaseAnalytics,
    private modalCtrl: ModalController
    ) {
    if (this.route.snapshot.queryParams.producto) {
      this.productoActual = this.route.snapshot.queryParams.producto;
    }
  }

  ngOnInit() {
    this.cargar();
  };

  ngOnDestroy() {
    if (this.loadingActivo) {
      this.loadingActivo.dismiss().catch(() => {});
      this.loadingActivo = null;
    }
  }

  // Issue #154: tap en la foto (o miniatura de vídeo) la abre a pantalla completa
  // con pinch-to-zoom y doble tap, sustituyendo a la librería muerta ngx-ionic-image-viewer.
  async ampliarImagen(urlImagen: string): Promise<void> {
    if (!urlImagen) { return; }
    this.firebaseAnalytics.logEvent("ampliar_imagen", { imagen: urlImagen });
    const modal = await this.modalCtrl.create({
      component: VisorImagenComponent,
      componentProps: { imgSrc: urlImagen }
    });
    await modal.present();
  }

  async cargar() {
    let loading = await this.loadingCtrl.create({
      message: 'Cargando Producto...',
    });
    this.loadingActivo = loading;

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
          this.loadingActivo = null;
        },
        async () => {
          await loading.dismiss();
          this.loadingActivo = null;
        }
      );
  }

  async cargarClientes() {
    let loading = await this.loadingCtrl.create({
      message: 'Cargando Clientes...',
    });
    this.loadingActivo = loading;
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
          this.loadingActivo = null;
        },
        async () => {
          await loading.dismiss();
          this.loadingActivo = null;
        }
      );
  }

  public abrirVideo(video: any): void {
    if (video.UrlVideo) {
      window.open(video.UrlVideo, '_system', 'location=yes');
    }
  }

  async cargarVideos() {
    let loading = await this.loadingCtrl.create({
      message: 'Cargando vídeos...'
    });
    await loading.present();
  
    this.servicio.cargarVideosProducto(this.productoActual).subscribe(
      async data => {
        this.firebaseAnalytics.logEvent("producto_ver_videos", {producto: this.productoActual});
        this.videos = data;
      },
      async error => {
        await loading.dismiss();
      },
      async () => {
        await loading.dismiss();
      }
    );
  }
  
  segmentChanged(event: any) {
    if (event.detail.value === 'videos' && this.videos.length === 0) {
      this.cargarVideos();
    }
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
