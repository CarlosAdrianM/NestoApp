import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import {
  CalcularSugerenciasProductos, MiResumenSugerencias, ProductoCarritoSugerencia, RespuestaSugerencia, ResultadoRespuestaSugerencia, SugerenciasProductos
} from '../models/sugerencias-productos.model';

/** NestoApp#235 / NestoAPI#670. Es una ayuda: si la API falla o tarda, no hay sugerencias y ya está. */
@Injectable({
  providedIn: 'root'
})
export class SugerenciasProductosService {
  static readonly TIEMPO_MAXIMO_MS = 8000;

  constructor(private http: HttpClient) { }

  /** null si falla o tarda (la plantilla sigue igual, sin el botón). */
  public calcular(peticion: CalcularSugerenciasProductos): Observable<SugerenciasProductos | null> {
    return this.http.post<SugerenciasProductos>(`${Configuracion.API_URL}/SugerenciasProductos/Calcular`, peticion).pipe(
      timeout(SugerenciasProductosService.TIEMPO_MAXIMO_MS),
      map(r => r || null),
      catchError(() => of(null))
    );
  }

  /** NestoApp#265 / NestoAPI#751: lo que gana el vendedor marcando ✓/✗. null si falla o la API es anterior: no sale nada. */
  public miResumen(): Observable<MiResumenSugerencias | null> {
    return this.http.get<MiResumenSugerencias>(`${Configuracion.API_URL}/SugerenciasProductos/MiResumen`).pipe(
      timeout(SugerenciasProductosService.TIEMPO_MAXIMO_MS),
      map(r => (r && r.Frase) ? r : null),
      catchError(() => of(null))
    );
  }

  /** null si falla: la tarjeta se quita igual (el vendedor ya ha decidido). */
  public responder(idSugerencia: number, respuesta: RespuestaSugerencia, productos: ProductoCarritoSugerencia[]): Observable<ResultadoRespuestaSugerencia | null> {
    return this.http.post<ResultadoRespuestaSugerencia>(
      `${Configuracion.API_URL}/SugerenciasProductos/${idSugerencia}/Respuesta`, { Respuesta: respuesta, Productos: productos }
    ).pipe(
      timeout(SugerenciasProductosService.TIEMPO_MAXIMO_MS),
      catchError(() => of(null))
    );
  }
}
