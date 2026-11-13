import { Component, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Globo } from 'src/app/models/globo.model';

/** El contenido del globo (NestoAPI#774): título, texto, «Entendido» y, si explica una novedad, «Ver la novedad». */
@Component({
  selector: 'app-globo',
  template: `
    <div class="globo">
      <h3 *ngIf="globo?.Titulo"><ion-icon name="bulb-outline" color="warning"></ion-icon> {{ globo.Titulo }}</h3>
      <p>{{ globo?.Texto }}</p>
      <div class="botones">
        <ion-button *ngIf="globo?.NovedadId" fill="clear" size="small" (click)="cerrar('novedad')">Ver la novedad</ion-button>
        <ion-button size="small" (click)="cerrar('visto')">Entendido</ion-button>
      </div>
    </div>`,
  styles: [`
    .globo { padding: 12px 14px 6px 14px; }
    h3 { margin: 0 0 6px 0; font-size: 1.05em; font-weight: 600; display: flex; align-items: center; gap: 6px; }
    p { margin: 0 0 8px 0; white-space: pre-line; line-height: 1.35; }
    .botones { display: flex; justify-content: flex-end; gap: 4px; }`],
  standalone: false
})
export class GloboComponent {
  @Input() globo: Globo;

  constructor(private popoverCtrl: PopoverController) { }

  public cerrar(rol: 'visto' | 'novedad'): void {
    this.popoverCtrl.dismiss(null, rol);
  }
}
