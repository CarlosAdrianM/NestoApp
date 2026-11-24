import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  BloqueDireccion, aplicarDetalleGoogle, ayudaCodigoPostal, codigoPostalEditable, olvidarGoogle
} from 'src/app/models/direccion-alta.model';
import { ClienteService } from '../cliente.service';

/**
 * NestoApp#288 (NestoAPI#879): una dirección del alta, igual que la fiscal: se busca en Google, se pide el número si
 * Google no lo da, «¿Qué es?», código postal (que no se teclea salvo que Google no lo dé), teléfono y comentarios de
 * ruta y de picking. Hoy se usa para «La entrega es en otra dirección». Las reglas están en direccion-alta.model;
 * validar con la API y decidir si se sigue es cosa de la pantalla del cliente (el mismo camino que la fiscal).
 */
@Component({
  selector: 'bloque-direccion-alta',
  templateUrl: './bloque-direccion-alta.component.html',
  styleUrls: ['../cliente.component.scss'],
  standalone: false
})
export class BloqueDireccionAltaComponent implements OnDestroy {
  @Input() bloque: BloqueDireccion = {};
  /** Para distinguir los `name` de los campos del bloque fiscal. */
  @Input() sufijo: string = 'Entrega';

  public sugerencias: any[] = [];
  private termino$ = new Subject<string>();
  private sessionToken: string | null = null;
  private suscripcion: Subscription;

  constructor(private servicio: ClienteService) {
    this.suscripcion = this.termino$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((texto: string) => {
        if (!texto || texto.trim().length < 3) {
          return of([]);
        }
        if (!this.sessionToken) {
          this.sessionToken = BloqueDireccionAltaComponent.nuevoToken();
        }
        return this.servicio.buscarSugerenciasDireccion(texto.trim(), this.sessionToken).pipe(catchError(() => of([])));
      })
    ).subscribe((sugerencias: any[]) => this.sugerencias = sugerencias || []);
  }

  ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  get cpEditable(): boolean { return codigoPostalEditable(this.bloque, true); }
  get ayudaCp(): string { return ayudaCodigoPostal(this.bloque, true); }

  /** Teclear a mano deja la dirección sin verificar: hay que elegirla de la lista. */
  public buscar(evento: any): void {
    const texto = evento?.detail?.value ?? '';
    this.bloque.direccionVerificada = false;
    this.bloque.codigoPostalSinDarPorGoogle = false;
    this.bloque.numeroSinDarPorGoogle = false;
    this.termino$.next(texto);
  }

  public elegir(sugerencia: any): void {
    this.servicio.leerDetalleDireccion(sugerencia.placeId, this.sessionToken).subscribe(
      (detalle: any) => {
        aplicarDetalleGoogle(this.bloque, detalle);
        this.sugerencias = [];
        this.sessionToken = null; // la sesión de Places termina con el Detalle
      },
      () => { this.sugerencias = []; } // si el detalle falla, se sigue buscando
    );
  }

  /** Borra la dirección (la buscada y la ya validada) para buscar otra. */
  public limpiar(): void {
    this.bloque.direccion = '';
    this.bloque.direccionValidada = false;
    olvidarGoogle(this.bloque);
    this.sugerencias = [];
    this.sessionToken = null;
  }

  /** Otro número: hay que volver a preguntar a Google. */
  public numeroCambiado(): void {
    this.bloque.numeroConfirmadoSinGoogle = false;
    this.bloque.direccionValidada = false;
  }

  private static nuevoToken(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
