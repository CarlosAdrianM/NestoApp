// src/app/resumen-ventas/resumen-ventas.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { ResumenVentas, ResumenVentasResponse } from './resumen-ventas.model';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';


@Injectable({
  providedIn: 'root'
})
export class ResumenVentasService {
  private readonly baseUrl: string;
  private _baseUrl: string = Configuracion.API_URL + '/ventascliente/resumen';

  constructor(
    private http: HttpClient,    
  ) {
    
  }

  obtenerResumenVentas(cliente: string, contacto: string, modoComparativa: string, agruparPor: string): Observable<ResumenVentas[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('clienteId', cliente);
    params = params.append('modoComparativa', modoComparativa);
    params = params.append('agruparPor', agruparPor);

    return this.http.get<ResumenVentasResponse>(this._baseUrl, { params: params }).pipe(
        map(response => {
          // Transformar los datos
          const datosTransformados = response.Datos.map(item => ({
            nombre: item.Nombre,
            ventaAnnoActual: item.VentaAnnoActual,
            ventaAnnoAnterior: item.VentaAnnoAnterior,
            diferencia: item.VentaAnnoActual - item.VentaAnnoAnterior,
            ratio: item.VentaAnnoAnterior !== 0 ? (item.VentaAnnoActual - item.VentaAnnoAnterior) / item.VentaAnnoAnterior : 0
          }));
    
          // Ordenar por diferencia de menor a mayor
          datosTransformados.sort((a, b) => a.diferencia - b.diferencia);
    
          // Calcular totales
          const totalActual = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoActual, 0);
          const totalAnterior = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoAnterior, 0);
          const totalDiferencia = totalActual - totalAnterior;
          const totalRatio = totalAnterior !== 0 ? totalDiferencia / totalAnterior : 0;
    
          // Agregar fila de total
          const filaTotal: ResumenVentas = {
            nombre: 'TOTAL',
            ventaAnnoActual: totalActual,
            ventaAnnoAnterior: totalAnterior,
            diferencia: totalDiferencia,
            ratio: totalRatio
          };
    
          return [...datosTransformados, filaTotal];
        }),
        catchError((error) => {
          console.error('[ResumenVentasService] Error al obtener resumen de ventas:', error);
          return throwError(() => new Error('No se pudo obtener el resumen de ventas.'));
        })
      );
  }
}
