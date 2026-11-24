import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { AvisoCampanaSoloEnStock } from '../models/campana-solo-en-stock.model';

/**
 * NestoApp#293 / NestoAPI#889: consulta ANTES de guardar si el pedido lleva productos de una campaña «solo en
 * stock» de los que no hay bastante. Solo lectura. Si la llamada falla (o la API aún no lo tiene: 404), no se
 * pregunta y se guarda como siempre: nunca lanza.
 */
@Injectable({
  providedIn: 'root'
})
export class CampanaSoloEnStockService {
  private readonly url = `${Configuracion.API_URL}/PedidosVenta/AvisoCampanaSoloEnStock`;
  private static readonly SIN_AVISO: AvisoCampanaSoloEnStock = { HayAviso: false };

  constructor(private http: HttpClient) { }

  /** `pedido` = el PedidoVentaDTO tal como se va a guardar. */
  public consultar(pedido: any): Observable<AvisoCampanaSoloEnStock> {
    return this.http.post<AvisoCampanaSoloEnStock>(this.url, pedido).pipe(
      timeout(15000),
      map(a => a || CampanaSoloEnStockService.SIN_AVISO),
      catchError(() => of(CampanaSoloEnStockService.SIN_AVISO))
    );
  }
}
