import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { AutorizacionPedido, ResolucionAutorizacionPedido, SolicitudAutorizacionCreada } from '../models/autorizacion-pedido.model';

/**
 * NestoApp#280 / #290 punto 5 (Novedades 1258, gemela de Nesto): pedir autorización de un pedido que no pasa la
 * validación de ofertas y descuentos, y verlas, anularlas, autorizarlas o denegarlas. Quién ve y hace qué lo decide la
 * API (403). Sin la tabla, los seis endpoints dan 503.
 */
@Injectable({
  providedIn: 'root'
})
export class AutorizacionesPedidoService {
  private readonly url = `${Configuracion.API_URL}/PedidosVenta/Autorizaciones`;

  constructor(private http: HttpClient) { }

  /**
   * `pedido` = el mismo cuerpo que se iba a mandar a POST api/PedidosVenta. 201 con a quién le ha llegado.
   * 400 si no necesita autorización; 409 { Message, Codigo: YA_SOLICITADA, Id } si ya la pidió y sigue pendiente.
   */
  public pedir(pedido: any, comentario?: string | null): Observable<SolicitudAutorizacionCreada> {
    return this.http.post<SolicitudAutorizacionCreada>(this.url, { Pedido: pedido, Comentario: (comentario || '').trim() || null });
  }

  /** Las de los últimos 30 días: las suyas y, si `mias` es false, también las que puede autorizar. */
  public leer(pendientes: boolean, mias: boolean): Observable<AutorizacionPedido[]> {
    const params = new HttpParams().set('pendientes', pendientes ? 'true' : 'false').set('mias', mias ? 'true' : 'false');
    return this.http.get<AutorizacionPedido[]>(this.url, { params }).pipe(map(lista => lista || []));
  }

  /** Con el pedido guardado (`Pedido`). 403 si no es suya ni la puede autorizar; 404 si no existe. */
  public leerUna(id: number): Observable<AutorizacionPedido> {
    return this.http.get<AutorizacionPedido>(`${this.url}/${id}`);
  }

  /** Crea el pedido tal cual, a nombre de quien lo pidió. Si el alta falla, llega su error y sigue Pendiente. */
  public autorizar(id: number, comentario?: string | null): Observable<ResolucionAutorizacionPedido> {
    return this.http.post<ResolucionAutorizacionPedido>(`${this.url}/${id}/Autorizar`, { Comentario: (comentario || '').trim() || null });
  }

  /** Motivo obligatorio (1..500). */
  public denegar(id: number, motivo: string): Observable<ResolucionAutorizacionPedido> {
    return this.http.post<ResolucionAutorizacionPedido>(`${this.url}/${id}/Denegar`, { Motivo: (motivo || '').trim() });
  }

  /** Solo quien la pidió. 409 si ya no está Pendiente. */
  public anular(id: number): Observable<ResolucionAutorizacionPedido> {
    return this.http.delete<ResolucionAutorizacionPedido>(`${this.url}/${id}`);
  }
}
