import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * NestoApp#198: el buscador de clientes de siempre, en un modal, para elegir a qué cliente (y
 * contacto) se pasa un pedido. Devuelve el cliente elegido al cerrar, o nada si se cancela.
 */
@Component({
  selector: 'modal-elegir-cliente',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Pasar el pedido a...</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancelar()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <selector-clientes (seleccionar)="elegir($event)"></selector-clientes>
    </ion-content>
  `,
  standalone: false
})
export class ModalElegirClienteComponent {

  constructor(private modalCtrl: ModalController) { }

  public elegir(cliente: any): void {
    this.modalCtrl.dismiss(cliente, 'elegido');
  }

  public cancelar(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
