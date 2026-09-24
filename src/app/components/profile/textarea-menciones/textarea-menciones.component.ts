import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { NovedadesService } from 'src/app/services/novedades.service';
import { Mencionable, filtrarMencionables, insertarMencion, mencionEnCurso } from 'src/app/utils/menciones';

/**
 * NestoApp#194 / NestoAPI#537: cuadro de texto de Novedades (comentarios y sugerencias) que, al
 * escribir @, despliega a quién se puede mencionar, filtrado mientras se escribe. Al elegir se
 * inserta «@Nombre »; la API detecta las menciones al guardar y avisa por push al mencionado.
 */
@Component({
  selector: 'textarea-menciones',
  templateUrl: './textarea-menciones.component.html',
  styleUrls: ['./textarea-menciones.component.scss'],
  standalone: false
})
export class TextareaMencionesComponent {

  @Input() public texto: string = '';
  @Output() public textoChange = new EventEmitter<string>();
  @Input() public placeholder: string = '';
  @Input() public etiqueta: string = '';
  /** Para que el padre adjunte la imagen pegada (captura-adjunta). */
  @Output() public pegar = new EventEmitter<ClipboardEvent>();

  @ViewChild('area') public area: IonTextarea;

  /** Las opciones del desplegable; vacío = cerrado. */
  public candidatos: Mencionable[] = [];
  private mencionables: Mencionable[] | null = null;
  /** Dónde empieza la mención que se está escribiendo y dónde está el cursor. */
  private enCurso: { inicio: number; cursor: number } | null = null;

  constructor(private servicio: NovedadesService) { }

  public async alEscribir(evento: any): Promise<void> {
    this.texto = evento?.detail?.value ?? '';
    this.textoChange.emit(this.texto);
    const cursor = await this.leerCursor();
    this.actualizarCandidatos(cursor);
  }

  /** Separado del evento para poder probarlo sin el ion-textarea real. */
  public actualizarCandidatos(cursor: number): void {
    const mencion = mencionEnCurso(this.texto, cursor);
    if (!mencion) {
      this.cerrar();
      return;
    }
    this.enCurso = { inicio: mencion.inicio, cursor };
    if (this.mencionables) {
      this.candidatos = filtrarMencionables(this.mencionables, mencion.filtro);
      return;
    }
    this.servicio.leerMencionables().subscribe(lista => {
      this.mencionables = lista.length ? lista : null; // si ha fallado, se reintenta en la próxima @
      if (this.enCurso) {
        this.candidatos = filtrarMencionables(lista, mencion.filtro);
      }
    });
  }

  public async elegir(persona: Mencionable): Promise<void> {
    if (!this.enCurso) {
      return;
    }
    const resultado = insertarMencion(this.texto, this.enCurso.inicio, this.enCurso.cursor, persona.Nombre);
    this.texto = resultado.texto;
    this.textoChange.emit(this.texto);
    this.cerrar();
    await this.ponerCursor(resultado.cursor);
  }

  public cerrar(): void {
    this.candidatos = [];
    this.enCurso = null;
  }

  private async leerCursor(): Promise<number> {
    try {
      const nativo = await this.area?.getInputElement();
      return nativo?.selectionStart ?? this.texto.length;
    } catch {
      return this.texto.length;
    }
  }

  private async ponerCursor(posicion: number): Promise<void> {
    try {
      const nativo = await this.area?.getInputElement();
      if (nativo) {
        nativo.value = this.texto; // antes de mover el cursor, que el [value] aún no se ha aplicado
        nativo.focus();
        nativo.setSelectionRange(posicion, posicion);
      }
    } catch {
      // Sin cursor no pasa nada: la mención ya está en el texto.
    }
  }
}
