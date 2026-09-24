import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/**
 * NestoApp#176 / NestoAPI#387: una notificación del buzón. Datos trae lo mismo que la push (tipo,
 * novedadId, comentarioId, ruta…), así que tocarla navega igual (rutaDeNotificacion).
 */
export interface NotificacionBuzon {
  Id: number;
  Titulo: string;
  Cuerpo: string;
  Datos: { [clave: string]: string } | null;
  FechaCreacion: string;
  Leida: boolean;
}

const APLICACION = 'NestoApp';
export const TAMANO_PAGINA_BUZON = 20;

// Paginación como en TiendasNuevaVision#36: la API pagina por número de página y la lista cambia
// mientras se mira (se borran avisos, llegan otros arriba). La página siguiente se calcula con lo
// cargado, no con un contador que se desfasa, y lo repetido se descarta por Id.

export function siguientePagina(cargadas: number, tamanoPagina: number = TAMANO_PAGINA_BUZON): number {
  return tamanoPagina <= 0 ? 1 : Math.floor(cargadas / tamanoPagina) + 1;
}

/** Si la última página vino llena, puede haber más. */
export function puedeHaberMas(recibidas: number, tamanoPagina: number = TAMANO_PAGINA_BUZON): boolean {
  return recibidas >= tamanoPagina;
}

export function nuevasNotificaciones(cargadas: NotificacionBuzon[], pagina: NotificacionBuzon[]): NotificacionBuzon[] {
  const ids = new Set((cargadas || []).map(n => n.Id));
  return (pagina || []).filter(n => n && !ids.has(n.Id) && ids.add(n.Id));
}

/** Para el badge: vacío sin avisos, «99+» a partir de cien. */
export function textoContador(noLeidas: number): string {
  return noLeidas <= 0 ? '' : noLeidas > 99 ? '99+' : String(noLeidas);
}

@Injectable({
  providedIn: 'root'
})
export class BuzonNotificacionesService {

  private readonly url = Configuracion.API_URL + '/Notificaciones/Buzon';
  private readonly noLeidasSubject = new BehaviorSubject<number>(0);
  /** Lo que pintan el menú y la campana del perfil. */
  public readonly noLeidas$: Observable<number> = this.noLeidasSubject.asObservable();

  constructor(private http: HttpClient) { }

  public leer(pagina: number, tamanoPagina: number = TAMANO_PAGINA_BUZON): Observable<NotificacionBuzon[]> {
    const params = new HttpParams()
      .set('aplicacion', APLICACION)
      .set('soloNoLeidas', 'false')
      .set('pagina', String(pagina))
      .set('tamanoPagina', String(tamanoPagina));
    return this.http.get<NotificacionBuzon[]>(this.url, { params }).pipe(map(lista => lista || []));
  }

  /**
   * Nunca molesta: sin red, fuera de horario o con la sesión caducada se queda con lo último que
   * sabía. Al arrancar, al volver a primer plano, al llegar una push y al abrir el menú.
   */
  public refrescarContador(): void {
    const params = new HttpParams().set('aplicacion', APLICACION);
    this.http.get<number>(this.url + '/NoLeidas', { params }).subscribe({
      next: n => this.noLeidasSubject.next(Number(n) || 0),
      error: error => console.log('No se ha podido refrescar el contador de avisos', error?.status)
    });
  }

  public marcarLeida(id: number): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}/Leida`, null).pipe(tap(() => this.restar()));
  }

  public marcarTodasLeidas(): Observable<number> {
    const params = new HttpParams().set('aplicacion', APLICACION);
    return this.http.put<number>(this.url + '/Leidas', null, { params }).pipe(tap(() => this.noLeidasSubject.next(0)));
  }

  /** Borrado lógico. Si no estaba leída, deja de contar. */
  public eliminar(id: number, estabaNoLeida: boolean): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(tap(() => {
      if (estabaNoLeida) {
        this.restar();
      }
    }));
  }

  /** Al cerrar sesión el badge no puede quedarse con el número del usuario anterior. */
  public reiniciar(): void {
    this.noLeidasSubject.next(0);
  }

  private restar(): void {
    this.noLeidasSubject.next(Math.max(0, this.noLeidasSubject.value - 1));
  }
}
