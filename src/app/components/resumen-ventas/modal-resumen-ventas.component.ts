import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'modal-resumen-ventas',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Resumen de Ventas</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <app-resumen-ventas
        [cliente]="cliente"
        [contacto]="contacto">
      </app-resumen-ventas>
    </ion-content>
  `
})
export class ModalResumenVentasComponent {
  @Input() cliente: string = '';
  @Input() contacto: string = '';

  constructor(private modalCtrl: ModalController) {}

  cerrar(): void {
    this.modalCtrl.dismiss();
  }
}
