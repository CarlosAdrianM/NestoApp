import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TAMANO_MAXIMO_IMAGEN } from 'src/app/services/novedades.service';
import { ajustarImagen, leerComoDataUrl } from 'src/app/utils/ajustar-imagen';

export interface ImagenAdjunta {
  dataUrl: string;
  tipo: string;
}

/**
 * NestoApp#188 / #190: la captura que acompaña a un comentario o a una sugerencia, desde la galería
 * (donde van los pantallazos en el móvil), pegada en el cuadro de texto o con «Pegar imagen». Lo que
 * se proyecta dentro (el botón de enviar del padre) va en la misma fila que sus botones.
 *
 * Para pegar con pulsación larga, el cuadro de texto del padre llama a `alPegar`:
 * `<ion-textarea (paste)="captura.alPegar($event)">` … `<captura-adjunta #captura [(imagen)]="…">`.
 */
@Component({
  selector: 'captura-adjunta',
  templateUrl: './captura-adjunta.component.html',
  styleUrls: ['./captura-adjunta.component.scss'],
  standalone: false
})
export class CapturaAdjuntaComponent {

  @Input() public imagen: ImagenAdjunta | null = null;
  @Output() public imagenChange = new EventEmitter<ImagenAdjunta | null>();

  public errorImagen: string = '';
  /** El de la API; sustituible en los tests. */
  public tamanoMaximoImagen: number = TAMANO_MAXIMO_IMAGEN;

  /** El portapapeles del sistema solo se puede leer donde el WebView lo permite. */
  public readonly puedeLeerPortapapeles: boolean = typeof navigator !== 'undefined' && !!(navigator.clipboard as any)?.read;

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

  /**
   * En el móvil lo normal es un pantallazo elegido de la galería: si no cabe en los 2 MB de la API o
   * no es PNG/JPEG, se reduce a un JPEG que sí quepa en vez de rechazarlo.
   */
  public async adjuntarImagen(imagen: Blob): Promise<void> {
    let ajustada: Blob;
    try {
      ajustada = await ajustarImagen(imagen, this.tamanoMaximoImagen);
    } catch (error) {
      console.error('No se ha podido preparar la imagen', error);
      this.cambiarImagen(null);
      this.errorImagen = 'No se ha podido leer la imagen. Prueba con otra captura (PNG o JPEG).';
      return;
    }
    this.errorImagen = '';
    this.cambiarImagen({ dataUrl: await leerComoDataUrl(ajustada), tipo: ajustada.type.toLowerCase() });
  }

  public quitarImagen(): void {
    this.cambiarImagen(null);
    this.errorImagen = '';
  }

  private cambiarImagen(imagen: ImagenAdjunta | null): void {
    this.imagen = imagen;
    this.imagenChange.emit(imagen);
  }
}
