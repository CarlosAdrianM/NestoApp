import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  BloqueDireccion, TIPOS_LUGAR, TIPO_LOCAL, TIPO_NAVE, TIPO_OTRO, TIPO_PISO, componerDireccion2
} from 'src/app/models/direccion-alta.model';

/**
 * NestoApp#286 / #290 (NestoAPI#874, gemela de Nesto#643): «¿Qué es?» la dirección (piso, local, casa, nave u otro)
 * con los campos de cada tipo. Es lo que necesita el repartidor para encontrarla y acaba en la Dirección 2 del
 * cliente. Solo pinta y avisa: quien decide si se puede seguir es la pantalla que lo usa (y, al final, la API).
 */
@Component({
  selector: 'que-es-direccion',
  templateUrl: './que-es-direccion.component.html',
  standalone: false
})
export class QueEsDireccionComponent {
  /** El objeto que lleva tipoLugar, piso, puerta… (la ficha del cliente o la dirección de entrega). */
  @Input() bloque: BloqueDireccion = {};
  /** En el alta se avisa siempre de lo que falta; al modificar, solo con un tipo elegido. */
  @Input() esAlta: boolean = true;
  /** Para distinguir los `name` de los campos cuando hay dos bloques en la pantalla. */
  @Input() sufijo: string = '';
  /** Al modificar, tras cambiar la calle: el texto que pide revisar «¿Qué es?» (null si no hay que revisar). */
  @Input() avisoRevisar: string | null = null;
  /** Al modificar: se puede dejar al cliente sin «¿Qué es?». */
  @Input() puedeQuitar: boolean = false;
  /** Se ha pulsado «Quitar» y se borrará al guardar. */
  @Input() seQuitara: boolean = false;
  /** Ancla del globo que señala el control (solo en el bloque fiscal). */
  @Input() ancla: string | null = null;

  @Output() cambiado = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();
  @Output() quitar = new EventEmitter<void>();

  public readonly tipos = TIPOS_LUGAR;

  get esPiso(): boolean { return this.bloque?.tipoLugar === TIPO_PISO; }
  get esLocal(): boolean { return this.bloque?.tipoLugar === TIPO_LOCAL; }
  get esNave(): boolean { return this.bloque?.tipoLugar === TIPO_NAVE; }
  get esOtro(): boolean { return this.bloque?.tipoLugar === TIPO_OTRO; }

  /** Cómo quedará guardado («1º D», «LOCAL 6 · RÓTULO: EL EDÉN»); vacío mientras falte algo. */
  get vistaPrevia(): string {
    return componerDireccion2(this.bloque).direccion2 || '';
  }

  /** Lo que falta (de usted). Al modificar sin tipo elegido no se avisa de nada. */
  get aviso(): string | null {
    if (this.avisoRevisar) {
      return this.avisoRevisar;
    }
    if (!this.esAlta && !this.bloque?.tipoLugar) {
      return null;
    }
    return componerDireccion2(this.bloque).motivo;
  }

  public alCambiar(): void {
    this.cambiado.emit();
  }
}
