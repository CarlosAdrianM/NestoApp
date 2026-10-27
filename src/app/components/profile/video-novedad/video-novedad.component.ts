import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { MENSAJE_VIDEO_NO_DISPONIBLE, Novedad, NovedadesService } from 'src/app/services/novedades.service';

/**
 * NestoApp#251 / NestoAPI#711: el vídeo corto de una novedad (como mucho uno por versión, unos 20 s, sin
 * audio). El MP4 va con el JWT, así que no vale un <video src> a la URL: se baja como blob y se reproduce
 * desde un objectURL. Al empezar a reproducir se apunta en la API (si falla, se ignora).
 */
@Component({
  selector: 'video-novedad',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ novedad?.Titulo }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding video-novedad">
      <ion-item *ngIf="cargando" lines="none">
        <ion-spinner slot="start" name="crescent"></ion-spinner>
        <ion-label>Cargando el vídeo…</ion-label>
      </ion-item>
      <ion-text color="danger" *ngIf="error"><p>{{ error }}</p></ion-text>
      <video *ngIf="url" [src]="url" controls autoplay muted playsinline (play)="alReproducir()"></video>
    </ion-content>
  `,
  styles: [`
    .video-novedad video { width: 100%; max-height: 70vh; border-radius: 8px; background: #000; }
  `],
  standalone: false
})
export class VideoNovedadComponent implements OnInit, OnDestroy {
  @Input() novedad: Novedad;

  public url: string | null = null;
  public cargando = false;
  public error = '';
  private reproduccionRegistrada = false;

  constructor(private modalCtrl: ModalController, private novedades: NovedadesService) { }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  public async cargar(): Promise<void> {
    if (!this.novedad?.Id) {
      return;
    }
    this.cargando = true;
    this.error = '';
    try {
      const blob = await firstValueFrom(this.novedades.descargarVideo(this.novedad.Id));
      this.url = URL.createObjectURL(blob.type ? blob : new Blob([blob], { type: 'video/mp4' }));
    } catch (e: any) {
      const estado = e?.statusCode ?? e?.status;
      this.error = estado === 404 ? MENSAJE_VIDEO_NO_DISPONIBLE : 'No se ha podido cargar el vídeo. Inténtelo otra vez en un rato.';
    } finally {
      this.cargando = false;
    }
  }

  /** Una vez por apertura; la API saca el cliente («NestoApp») del token. */
  public alReproducir(): void {
    if (this.reproduccionRegistrada || !this.novedad?.Id) {
      return;
    }
    this.reproduccionRegistrada = true;
    this.novedades.registrarReproduccionVideo(this.novedad.Id).subscribe({ error: () => { } });
  }

  public cerrar(): void {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy(): void {
    if (this.url) {
      URL.revokeObjectURL(this.url);
      this.url = null;
    }
  }
}
