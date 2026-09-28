import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TAMANO_MAXIMO_IMAGEN } from 'src/app/services/novedades.service';
import { ajustarImagen, leerComoDataUrl } from 'src/app/utils/ajustar-imagen';

export interface ImagenAdjunta {
  dataUrl: string;
  tipo: string;
}

class TiempoAgotado extends Error { }

function conTiempoMaximo<T>(promesa: Promise<T>, milisegundos: number): Promise<T> {
  let temporizador: any;
  const agotado = new Promise<never>((_, reject) => {
    temporizador = setTimeout(() => reject(new TiempoAgotado()), milisegundos);
  });
  return Promise.race([promesa, agotado]).finally(() => clearTimeout(temporizador));
}

/** #195: «image/webp, 3,2 MB», para el aviso y el log. */
function describirFichero(imagen: Blob): string {
  const megas = (imagen.size / (1024 * 1024)).toLocaleString('es-ES', { maximumFractionDigits: 1 });
  return `${imagen.type || 'tipo desconocido'}, ${megas} MB`;
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
  /** #195: mientras se lee y se ajusta la captura, para que se vea que algo está pasando. */
  public preparandoImagen: boolean = false;
  /** #195: nunca esperar para siempre; sustituible en los tests. */
  public tiempoMaximoPreparacionMs: number = 20000;
  /** El de la API; sustituible en los tests. */
  public tamanoMaximoImagen: number = TAMANO_MAXIMO_IMAGEN;

  /** El portapapeles del sistema solo se puede leer donde el WebView lo permite. */
  public readonly puedeLeerPortapapeles: boolean = typeof navigator !== 'undefined' && !!(navigator.clipboard as any)?.read;

  /**
   * #195: se espera a tener el fichero leído antes de vaciar el selector. En Android lo elegido en la
   * galería es un `content://` que el WebView puede soltar en cuanto se vacía el input.
   */
  public async alElegirFichero(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const fichero = input?.files?.[0];
    if (fichero) {
      await this.adjuntarImagen(fichero);
    } else {
      this.errorImagen = 'No ha llegado ninguna imagen de la galería. Vuelve a elegirla.';
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
   *
   * #195: toda la cadena (leer, ajustar, pasar a data URL) va dentro del try y con tiempo máximo:
   * pase lo que pase, o sale la miniatura o sale un aviso en rojo. Cada fallo tiene su mensaje
   * para poder saber cuál ha sido sin depurar el móvil.
   */
  public async adjuntarImagen(imagen: Blob): Promise<void> {
    const descripcion = describirFichero(imagen);
    this.errorImagen = '';
    this.preparandoImagen = true;
    try {
      const preparada = await conTiempoMaximo(this.prepararImagen(imagen), this.tiempoMaximoPreparacionMs);
      this.cambiarImagen(preparada);
    } catch (error) {
      console.error('No se ha podido preparar la imagen', descripcion, error);
      this.cambiarImagen(null);
      this.errorImagen = error instanceof TiempoAgotado
        ? `La imagen tarda demasiado en prepararse (${descripcion}). Prueba con otra captura.`
        : `No se ha podido leer la imagen (${descripcion}). Prueba con otra captura (PNG o JPEG).`;
    } finally {
      this.preparandoImagen = false;
    }
  }

  private async prepararImagen(imagen: Blob): Promise<ImagenAdjunta> {
    // Leer los bytes ya: si el fichero de la galería no se deja leer, falla aquí y no más tarde.
    const enMemoria = new Blob([await imagen.arrayBuffer()], { type: imagen.type });
    const ajustada = await ajustarImagen(enMemoria, this.tamanoMaximoImagen);
    return { dataUrl: await leerComoDataUrl(ajustada), tipo: ajustada.type.toLowerCase() };
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
