import { Component, Input } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import {
  ComentarioNovedad, Novedad, NovedadesService, NuevoComentarioNovedad,
  aplicarVoto, tieneFeedback, validarImagen
} from 'src/app/services/novedades.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { VisorImagenComponent } from '../../visor-imagen/visor-imagen.component';

export interface ImagenAdjunta {
  dataUrl: string;
  tipo: string;
}

/**
 * NestoApp#188 / NestoAPI#520: bajo cada novedad del perfil, 👍/👎 con su recuento y los
 * comentarios de todos, con captura opcional. Referencia de interfaz: ventana de Novedades de
 * Nesto (f5fccf67). Si la API no trae los contadores, no pinta nada.
 */
@Component({
  selector: 'novedad-feedback',
  templateUrl: './novedad-feedback.component.html',
  styleUrls: ['./novedad-feedback.component.scss'],
  standalone: false
})
export class NovedadFeedbackComponent {

  @Input() public novedad: Novedad;

  public comentariosAbiertos: boolean = false;
  public cargandoComentarios: boolean = false;
  public comentarios: ComentarioNovedad[] = [];
  /** Miniaturas ya bajadas, por Id de comentario (data URL). */
  public imagenes: { [idComentario: number]: string } = {};

  public nuevoTexto: string = '';
  public imagenAdjunta: ImagenAdjunta | null = null;
  public errorImagen: string = '';
  public enviando: boolean = false;

  /** El portapapeles del sistema solo se puede leer donde el WebView lo permite. */
  public readonly puedeLeerPortapapeles: boolean = typeof navigator !== 'undefined' && !!(navigator.clipboard as any)?.read;

  constructor(
    private servicio: NovedadesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private errorHandler: ErrorHandlerService
  ) { }

  get tieneFeedback(): boolean {
    return tieneFeedback(this.novedad);
  }

  get puedeEnviar(): boolean {
    return !!(this.nuevoTexto || '').trim() && !this.enviando;
  }

  /** Optimista: se pinta al momento y se revierte si la API falla. */
  public votar(pulsado: 1 | -1): void {
    const antes: Novedad = { ...this.novedad }; // copia: copiarVotos cambia el objeto compartido
    const { novedad, voto } = aplicarVoto(antes, pulsado);
    this.copiarVotos(novedad);
    this.servicio.votar(antes.Id, voto).subscribe({
      error: async error => {
        console.error('No se ha podido guardar el voto', error);
        this.copiarVotos(antes);
        const toast = await this.toastCtrl.create({ message: 'No se ha podido guardar el voto.', duration: 2500, color: 'warning' });
        await toast.present();
      }
    });
  }

  /** Se cambian los campos del mismo objeto: la lista del perfil lo comparte. */
  private copiarVotos(origen: Novedad): void {
    this.novedad.VotosPositivos = origen.VotosPositivos;
    this.novedad.VotosNegativos = origen.VotosNegativos;
    this.novedad.MiVoto = origen.MiVoto;
  }

  public abrirOCerrarComentarios(): void {
    this.comentariosAbiertos = !this.comentariosAbiertos;
    if (this.comentariosAbiertos) {
      this.cargarComentarios();
    }
  }

  private cargarComentarios(): void {
    this.cargandoComentarios = true;
    this.servicio.leerComentarios(this.novedad.Id).subscribe({
      next: comentarios => {
        this.comentarios = comentarios;
        this.cargandoComentarios = false;
        comentarios.filter(c => c.TieneImagen).forEach(c => this.cargarImagen(c.Id));
      },
      error: error => {
        console.error('No se han podido cargar los comentarios', error);
        this.cargandoComentarios = false;
      }
    });
  }

  private cargarImagen(idComentario: number): void {
    this.servicio.leerImagenComentario(idComentario).subscribe({
      next: async blob => { this.imagenes[idComentario] = await leerComoDataUrl(blob); },
      error: error => console.error('No se ha podido cargar la captura', error)
    });
  }

  public async ampliarImagen(idComentario: number): Promise<void> {
    const imgSrc = this.imagenes[idComentario];
    if (!imgSrc) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: VisorImagenComponent,
      componentProps: { imgSrc },
      cssClass: 'visor-imagen-modal'
    });
    await modal.present();
  }

  public async enviarComentario(): Promise<void> {
    if (!this.puedeEnviar) {
      return;
    }
    const comentario: NuevoComentarioNovedad = {
      Texto: this.nuevoTexto.trim(),
      VersionCliente: Configuracion.VERSION
    };
    if (this.imagenAdjunta) {
      comentario.ImagenBase64 = this.imagenAdjunta.dataUrl;
      comentario.ImagenTipo = this.imagenAdjunta.tipo;
    }
    this.enviando = true;
    this.servicio.crearComentario(this.novedad.Id, comentario).subscribe({
      next: creado => {
        this.enviando = false;
        if (this.imagenAdjunta && creado.TieneImagen) {
          this.imagenes[creado.Id] = this.imagenAdjunta.dataUrl;
        }
        this.comentarios = [...this.comentarios, creado];
        this.novedad.NumeroComentarios = (this.novedad.NumeroComentarios || 0) + 1;
        this.nuevoTexto = '';
        this.imagenAdjunta = null;
        this.errorImagen = '';
      },
      error: async error => {
        // Lo escrito no se pierde: el vendedor corrige (p. ej. la imagen) y vuelve a enviar.
        this.enviando = false;
        const alert = await this.alertCtrl.create({
          header: 'No se ha podido enviar el comentario',
          message: this.errorHandler.extractErrorDetail(error),
          buttons: ['Ok']
        });
        await alert.present();
      }
    });
  }

  public async borrarComentario(comentario: ComentarioNovedad): Promise<void> {
    if (!comentario.EsMio) {
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Borrar comentario',
      message: '¿Seguro que quieres borrar tu comentario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Borrar', handler: () => this.confirmarBorrado(comentario) }
      ]
    });
    await alert.present();
  }

  private confirmarBorrado(comentario: ComentarioNovedad): void {
    this.servicio.borrarComentario(comentario.Id).subscribe({
      next: () => {
        this.comentarios = this.comentarios.filter(c => c.Id !== comentario.Id);
        this.novedad.NumeroComentarios = Math.max(0, (this.novedad.NumeroComentarios || 0) - 1);
      },
      error: async error => {
        const aviso = await this.alertCtrl.create({
          header: 'No se ha podido borrar el comentario',
          message: this.errorHandler.extractErrorDetail(error),
          buttons: ['Ok']
        });
        await aviso.present();
      }
    });
  }

  // ---- Captura: desde la galería o pegada del portapapeles ----

  public alElegirFichero(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const fichero = input?.files?.[0];
    if (fichero) {
      this.adjuntarImagen(fichero);
    }
    if (input) {
      input.value = ''; // para poder volver a elegir la misma
    }
  }

  /** Pegar con pulsación larga en el cuadro de texto: si lo pegado es una imagen, se adjunta. */
  public alPegar(evento: ClipboardEvent): void {
    const items = Array.from(evento.clipboardData?.items || []);
    const imagen = items.find(i => i.kind === 'file' && i.type.startsWith('image/'));
    const fichero = imagen?.getAsFile();
    if (fichero) {
      evento.preventDefault();
      this.adjuntarImagen(fichero);
    }
  }

  public async pegarImagen(): Promise<void> {
    try {
      const items: any[] = await (navigator.clipboard as any).read();
      for (const item of items) {
        const tipo = (item.types as string[]).find(t => t.startsWith('image/'));
        if (tipo) {
          const blob: Blob = await item.getType(tipo);
          await this.adjuntarImagen(blob);
          return;
        }
      }
      this.errorImagen = 'No hay ninguna imagen copiada.';
    } catch (error) {
      console.error('No se ha podido leer el portapapeles', error);
      this.errorImagen = 'No se ha podido leer el portapapeles.';
    }
  }

  public async adjuntarImagen(imagen: Blob): Promise<void> {
    const error = validarImagen(imagen.type, imagen.size);
    if (error) {
      this.errorImagen = error;
      return;
    }
    this.errorImagen = '';
    this.imagenAdjunta = { dataUrl: await leerComoDataUrl(imagen), tipo: imagen.type.toLowerCase() };
  }

  public quitarImagen(): void {
    this.imagenAdjunta = null;
    this.errorImagen = '';
  }
}

function leerComoDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}
