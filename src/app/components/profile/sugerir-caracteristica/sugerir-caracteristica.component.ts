import { Component, EventEmitter, Output } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Novedad, NovedadesService, NuevoComentarioNovedad } from 'src/app/services/novedades.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { ImagenAdjunta } from '../captura-adjunta/captura-adjunta.component';
import { HistorialRutasService } from 'src/app/services/historial-rutas.service';

/** NestoApp#203 / NestoAPI#558: el mismo formulario sirve para sugerir y para avisar de un fallo. */
export type TipoAportacion = 'sugerencia' | 'incidencia';

/**
 * NestoApp#190 / NestoAPI#526: «Sugerir nueva característica» en la página de sugerencias de las
 * Novedades del perfil. Texto y captura, igual que un comentario (#188). La API saca el título de la
 * primera línea y la sugerencia entra en la lista para que la voten los demás.
 * NestoApp#203: con «Algo no funciona» el mismo formulario manda un aviso (EsIncidencia); la API
 * le añade el contexto (versión, pantalla y errores recientes del usuario) y avisa al supervisor.
 */
@Component({
  selector: 'sugerir-caracteristica',
  templateUrl: './sugerir-caracteristica.component.html',
  styleUrls: ['./sugerir-caracteristica.component.scss'],
  standalone: false
})
export class SugerirCaracteristicaComponent {

  @Output() public creada = new EventEmitter<Novedad>();

  /** Null = cerrado (se ven los dos botones). */
  public tipo: TipoAportacion | null = null;
  public texto: string = '';
  public imagenAdjunta: ImagenAdjunta | null = null;
  public enviando: boolean = false;

  constructor(
    private servicio: NovedadesService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService,
    private historialRutas: HistorialRutasService
  ) { }

  get abierto(): boolean {
    return this.tipo !== null;
  }

  get esIncidencia(): boolean {
    return this.tipo === 'incidencia';
  }

  get etiqueta(): string {
    return this.esIncidencia ? 'Tu aviso' : 'Tu sugerencia';
  }

  get placeholder(): string {
    return this.esIncidencia
      ? '¿Qué no funciona? Cuéntanos qué estabas haciendo y qué ha pasado'
      : '¿Qué te vendría bien que hiciera la app? La primera línea será el título.';
  }

  get textoBotonEnviar(): string {
    return this.esIncidencia ? 'Enviar aviso' : 'Enviar';
  }

  get puedeEnviar(): boolean {
    return !!(this.texto || '').trim() && !this.enviando;
  }

  public abrir(tipo: TipoAportacion = 'sugerencia'): void {
    this.tipo = tipo;
  }

  /** Cerrar descarta lo escrito: es un borrador de una línea, no un pedido. */
  public cancelar(): void {
    this.tipo = null;
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
    const esIncidencia = this.esIncidencia;
    if (esIncidencia) {
      sugerencia.EsIncidencia = true;
      const pantalla = this.historialRutas.pantallaAnterior();
      if (pantalla) {
        sugerencia.Pantalla = pantalla;
      }
    }
    this.enviando = true;
    this.servicio.crearSugerencia(sugerencia).subscribe({
      next: async creada => {
        this.enviando = false;
        this.cancelar();
        this.creada.emit(creada);
        const toast = await this.toastCtrl.create({
          message: esIncidencia
            ? '¡Gracias por avisar! Lo revisaremos y te diremos en qué versión queda arreglado.'
            : '¡Gracias! Tu sugerencia ya está en la lista para que la voten los demás.',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async error => {
        // Lo escrito no se pierde: se corrige y se vuelve a enviar.
        this.enviando = false;
        const alert = await this.alertCtrl.create({
          header: esIncidencia ? 'No se ha podido enviar el aviso' : 'No se ha podido enviar la sugerencia',
          message: this.errorHandler.extractErrorDetail(error),
          buttons: ['Ok']
        });
        await alert.present();
      }
    });
  }
}
