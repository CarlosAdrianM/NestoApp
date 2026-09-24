import { Pipe, PipeTransform } from '@angular/core';
import { TrozoTexto, trocearMenciones } from '../utils/menciones';

/**
 * NestoApp#194: el texto de un comentario o sugerencia en trozos, para pintar las @menciones
 * resaltadas: `<span *ngFor="let t of texto | trozosMencion" [class.mencion]="t.mencion">{{ t.texto }}</span>`.
 */
@Pipe({ name: 'trozosMencion', standalone: false })
export class TrozosMencionPipe implements PipeTransform {
  transform(texto: string | null | undefined): TrozoTexto[] {
    return trocearMenciones(texto || '');
  }
}
