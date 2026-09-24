import { Component, EventEmitter, Output } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Novedad, NovedadesService, NuevoComentarioNovedad } from 'src/app/services/novedades.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { ImagenAdjunta } from '../captura-adjunta/captura-adjunta.component';

/**
 * NestoApp#190 / NestoAPI#526: «Sugerir nueva característica» en la página de sugerencias de las
 * Novedades del perfil. Texto y captura, igual que un comentario (#188). La API saca el título de la
 * primera línea y la sugerencia entra en la lista para que la voten los demás.
 */
@Component({
  selector: 'sugerir-caracteristica',
  templateUrl: './sugerir-caracteristica.component.html',
  styleUrls: ['./sugerir-caracteristica.component.scss'],
  standalone: false
})
export class SugerirCaracteristicaComponent {

  @Output() public creada = new EventEmitter<Novedad>();

  public abierto: boolean = false;
  public texto: string = '';
  public imagenAdjunta: ImagenAdjunta | null = null;
  public enviando: boolean = false;

  constructor(
    private servicio: NovedadesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService
  ) { }

  get puedeEnviar(): boolean {
    return !!(this.texto || '').trim() && !this.enviando;
  }

  public abrir(): void {
    this.abierto = true;
  }

  /** Cerrar descarta lo escrito: es un borrador de una línea, no un pedido. */
  public cancelar(): void {
    this.abierto = false;
    this.texto = '';
    this.imagenAdjunta = null;
  }

  public enviar(): void {
    if (!this.puedeEnviar) {
      return;
    }
    const sugerencia: NuevoComentarioNovedad = {
      Texto: this.texto.trim(),
      VersionCliente: Configuracion.VERSION
    };
    if (this.imagenAdjunta) {
      sugerencia.ImagenBase64 = this.imagenAdjunta.dataUrl;
      sugerencia.ImagenTipo = this.imagenAdjunta.tipo;
    }
    this.enviando = true;
    this.servicio.crearSugerencia(sugerencia).subscribe({
      next: async creada => {
        this.enviando = false;
        this.cancelar();
        this.creada.emit(creada);
        const toast = await this.toastCtrl.create({
          message: '¡Gracias! Tu sugerencia ya está en la lista para que la voten los demás.',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async error => {
        // Lo escrito no se pierde: se corrige y se vuelve a enviar.
        this.enviando = false;
        const alert = await this.alertCtrl.create({
          header: 'No se ha podido enviar la sugerencia',
          message: this.errorHandler.extractErrorDetail(error),
          buttons: ['Ok']
        });
        await alert.present();
      }
    });
  }
}
