import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * Issue #154: visor de imagen a pantalla completa con pinch-to-zoom y doble tap.
 * Sustituye a la librería muerta ngx-ionic-image-viewer (sin soporte Angular moderno)
 * usando el módulo `zoom` de swiper, que ya es dependencia del proyecto.
 *
 * Uso:
 *   const modal = await this.modalCtrl.create({
 *     component: VisorImagenComponent,
 *     componentProps: { imgSrc: url },
 *     cssClass: 'visor-imagen-modal'
 *   });
 */
@Component({
  selector: 'app-visor-imagen',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="false" class="ion-no-padding">
      <swiper-container zoom="true" class="visor-swiper">
        <swiper-slide>
          <div class="swiper-zoom-container">
            <img [src]="imgSrc" />
          </div>
        </swiper-slide>
      </swiper-container>
    </ion-content>
  `,
  styles: [`
    :host, ion-content { --background: #000; background: #000; }
    ion-toolbar { --background: #000; --color: #fff; }
    .visor-swiper { width: 100%; height: 100%; background: #000; }
    .swiper-zoom-container { width: 100%; height: 100%; }
    .swiper-zoom-container img { max-width: 100%; max-height: 100%; object-fit: contain; }
  `],
  standalone: false
})
export class VisorImagenComponent {
  @Input() imgSrc: string;

  constructor(private modalCtrl: ModalController) {}

  cerrar(): void {
    this.modalCtrl.dismiss();
  }
}
