import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { BorradorMetadata } from 'src/app/models/borrador-plantilla-venta.model';
import { BorradorPlantillaVentaService } from 'src/app/services/borrador-plantilla-venta.service';

@Component({
  selector: 'modal-lista-borradores',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Borradores Guardados</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list *ngIf="borradores && borradores.length > 0">
        <ion-item-sliding *ngFor="let borrador of borradores">
          <ion-item (click)="seleccionar(borrador)" button>
            <ion-label>
              <h2>{{ borrador.nombreCliente || 'Sin cliente' }}</h2>
              <p>Cliente: {{ borrador.cliente }}</p>
              <p>
                {{ borrador.totalLineasProducto }} producto(s)
                <span *ngIf="borrador.totalLineasRegalo > 0">
                  + {{ borrador.totalLineasRegalo }} regalo(s)
                </span>
              </p>
              <p *ngIf="borrador.total > 0">Total: {{ borrador.total | number:'1.2-2' }} &euro;</p>
              <p class="fecha">{{ borrador.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</p>
              <p *ngIf="borrador.mensajeError" class="error-msg">
                <ion-icon name="warning-outline"></ion-icon>
                Guardado por error
              </p>
            </ion-label>
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="copiarJSON(borrador)">
              <ion-icon slot="icon-only" name="copy-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="eliminar(borrador)">
              <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <div class="empty-state" *ngIf="!borradores || borradores.length === 0">
        <ion-icon name="document-outline" size="large"></ion-icon>
        <p>No hay borradores guardados</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .fecha {
      color: var(--ion-color-medium);
      font-size: 0.8rem;
    }
    .error-msg {
      color: var(--ion-color-warning);
      font-size: 0.8rem;
    }
    .error-msg ion-icon {
      vertical-align: middle;
      margin-right: 4px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50%;
      color: var(--ion-color-medium);
    }
    .empty-state ion-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class ModalListaBorradoresComponent implements OnInit {
  @Input() borradores: BorradorMetadata[] = [];

  constructor(
    private modalCtrl: ModalController,
    private borradorService: BorradorPlantillaVentaService,
    private alertCtrl: AlertController,
    private firebaseAnalytics: FirebaseAnalytics
  ) {}

  ngOnInit(): void {
    // Los borradores se pasan como Input desde el padre
  }

  async cargarBorradores(): Promise<void> {
    this.borradores = await this.borradorService.obtenerBorradores();
  }

  seleccionar(borrador: BorradorMetadata): void {
    this.firebaseAnalytics.logEvent('borrador_seleccionado', { id: borrador.id });
    this.modalCtrl.dismiss({ accion: 'cargar', id: borrador.id });
  }

  async copiarJSON(borrador: BorradorMetadata): Promise<void> {
    try {
      const copiado = await this.borradorService.copiarBorradorJson(borrador.id);
      if (copiado) {
        const alert = await this.alertCtrl.create({
          header: 'Copiado',
          message: 'El JSON del borrador se ha copiado al portapapeles',
          buttons: ['Ok']
        });
        await alert.present();
        this.firebaseAnalytics.logEvent('borrador_json_copiado', { id: borrador.id });
      }
    } catch (error) {
      console.error('Error copiando JSON:', error);
    }
  }

  async eliminar(borrador: BorradorMetadata): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar borrador',
      message: '¿Está seguro de eliminar este borrador?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.borradorService.eliminarBorrador(borrador.id);
            this.firebaseAnalytics.logEvent('borrador_eliminado', { id: borrador.id });
            await this.cargarBorradores();
          }
        }
      ]
    });
    await alert.present();
  }

  cerrar(): void {
    this.modalCtrl.dismiss();
  }
}
