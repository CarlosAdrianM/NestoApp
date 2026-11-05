import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import {
  ComentarioNovedad, Novedad, NovedadesService, NuevoComentarioNovedad, aplicarVoto, tieneFeedback
} from 'src/app/services/novedades.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { VisorImagenComponent } from '../../visor-imagen/visor-imagen.component';
import { ImagenAdjunta, camposCapturas } from '../captura-adjunta/captura-adjunta.component';

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
export class NovedadFeedbackComponent implements OnChanges, OnDestroy {

  @Input() public novedad: Novedad;
  /**
   * NestoApp#193: el comentario al que lleva la push «Te han contestado en Novedades» (o una
   * @mención). Con él, los comentarios se abren solos y ese se lleva a la vista resaltado.
   */
  @Input() public comentarioResaltado: number | null = null;
  /** El que se ve resaltado ahora mismo (se apaga a los pocos segundos). */
  public comentarioResaltadoVisible: number | null = null;
  private temporizadorResaltado: any = null;

  public comentariosAbiertos: boolean = false;
  public cargandoComentarios: boolean = false;
  public comentarios: ComentarioNovedad[] = [];
  /** Miniaturas ya bajadas, por Id de comentario (data URLs, en orden). NestoApp#258: varias por comentario. */
  public imagenes: { [idComentario: number]: string[] } = {};

  public nuevoTexto: string = '';
  /** Las pone y las quita <captura-adjunta> (galería, pegar), con [(imagenes)]. */
  public imagenesAdjuntas: ImagenAdjunta[] = [];
  /** Compatibilidad: la primera. */
  get imagenAdjunta(): ImagenAdjunta | null { return this.imagenesAdjuntas[0] ?? null; }
  set imagenAdjunta(valor: ImagenAdjunta | null) { this.imagenesAdjuntas = valor ? [valor] : []; }
  public enviando: boolean = false;

  constructor(
    private servicio: NovedadesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private errorHandler: ErrorHandlerService
  ) { }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['comentarioResaltado'] && this.comentarioResaltado) {
      // Se piden siempre: si ya estaban abiertos, la respuesta nueva aún no está en la lista.
      this.comentariosAbiertos = true;
      this.cargarComentarios(this.comentarioResaltado);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorResaltado);
  }

  get tieneFeedback(): boolean {
    return tieneFeedback(this.novedad);
  }

  get puedeEnviar(): boolean {
    return !!(this.nuevoTexto || '').trim() && !this.enviando;
  }

  /** NestoApp#238: las privadas no admiten «Me gusta» (la API daría 400). */
  get puedeVotar(): boolean {
    return !this.novedad?.Privada;
  }

  /** Optimista: se pinta al momento y se revierte si la API falla. */
  public votar(pulsado: 1 | -1): void {
    if (!this.puedeVotar) {
      return;
    }
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

  private cargarComentarios(resaltar: number | null = null): void {
    this.cargandoComentarios = true;
    this.servicio.leerComentarios(this.novedad.Id).subscribe({
      next: comentarios => {
        this.comentarios = comentarios;
        this.cargandoComentarios = false;
        comentarios.filter(c => c.TieneImagen || c.Capturas?.length).forEach(c => this.cargarImagen(c));
        if (resaltar) {
          this.resaltarComentario(resaltar);
        }
      },
      error: error => {
        console.error('No se han podido cargar los comentarios', error);
        this.cargandoComentarios = false;
      }
    });
  }

  private resaltarComentario(idComentario: number): void {
    this.comentarioResaltadoVisible = idComentario;
    // Tras pintar la lista
    setTimeout(() => document.getElementById('comentario-' + idComentario)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    clearTimeout(this.temporizadorResaltado);
    this.temporizadorResaltado = setTimeout(() => this.comentarioResaltadoVisible = null, 4000);
  }

  /** NestoApp#258: todas las capturas del comentario; una imagen de antes sale por el endpoint de siempre. */
  private cargarImagen(comentario: ComentarioNovedad): void {
    this.servicio.leerCapturasComoDataUrl(comentario.Capturas, comentario.TieneImagen, () => this.servicio.leerImagenComentario(comentario.Id)).subscribe({
      next: urls => { if (urls.length) { this.imagenes[comentario.Id] = urls; } },
      error: error => console.error('No se ha podido cargar la captura', error)
    });
  }

  public async ampliarImagen(idComentario: number, indice: number = 0): Promise<void> {
    const imgSrc = this.imagenes[idComentario]?.[indice];
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
      VersionCliente: Configuracion.VERSION,
      ...camposCapturas(this.imagenesAdjuntas) // NestoApp#258
    };
    this.enviando = true;
    this.servicio.crearComentario(this.novedad.Id, comentario).subscribe({
      next: creado => {
        this.enviando = false;
        if (this.imagenesAdjuntas.length && (creado.TieneImagen || creado.Capturas?.length)) {
          this.imagenes[creado.Id] = this.imagenesAdjuntas.map(i => i.dataUrl);
        }
        this.comentarios = [...this.comentarios, creado];
        this.novedad.NumeroComentarios = (this.novedad.NumeroComentarios || 0) + 1;
        this.nuevoTexto = '';
        this.imagenesAdjuntas = [];
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
}
