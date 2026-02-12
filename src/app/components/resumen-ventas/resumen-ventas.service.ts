// src/app/resumen-ventas/resumen-ventas.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { DetalleProducto, DetalleProductoResponse, ResumenVentas, ResumenVentasResponse } from './resumen-ventas.model';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';


@Injectable({
  providedIn: 'root'
})
export class ResumenVentasService {
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
            ratio: item.VentaAnnoAnterior !== 0 ? (item.VentaAnnoActual - item.VentaAnnoAnterior) / item.VentaAnnoAnterior : 0,
            unidadesAnnoActual: item.UnidadesAnnoActual || 0,
            unidadesAnnoAnterior: item.UnidadesAnnoAnterior || 0
          }));

          // Ordenar por diferencia de menor a mayor
          datosTransformados.sort((a, b) => a.diferencia - b.diferencia);

          // Calcular totales
          const totalActual = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoActual, 0);
          const totalAnterior = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoAnterior, 0);
          const totalDiferencia = totalActual - totalAnterior;
          const totalRatio = totalAnterior !== 0 ? totalDiferencia / totalAnterior : 0;
          const totalUnidadesActual = datosTransformados.reduce((sum, item) => sum + item.unidadesAnnoActual, 0);
          const totalUnidadesAnterior = datosTransformados.reduce((sum, item) => sum + item.unidadesAnnoAnterior, 0);

          // Agregar fila de total
          const filaTotal: ResumenVentas = {
            nombre: 'TOTAL',
            ventaAnnoActual: totalActual,
            ventaAnnoAnterior: totalAnterior,
            diferencia: totalDiferencia,
            ratio: totalRatio,
            unidadesAnnoActual: totalUnidadesActual,
            unidadesAnnoAnterior: totalUnidadesAnterior
          };

          return [...datosTransformados, filaTotal];
        }),
        catchError((error) => {
          console.error('[ResumenVentasService] Error al obtener resumen de ventas:', error);
          return throwError(() => new Error('No se pudo obtener el resumen de ventas.'));
        })
      );
  }

  obtenerDetalleProductos(cliente: string, contacto: string, modoComparativa: string, agruparPor: string, filtro: string): Observable<DetalleProducto[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('clienteId', cliente);
    params = params.append('modoComparativa', modoComparativa);
    params = params.append('agruparPor', agruparPor);
    params = params.append('filtro', filtro);

    return this.http.get<DetalleProductoResponse>(this._baseUrl + '/detalle', { params: params }).pipe(
      map(response => {
        console.log('[ResumenVentasService] Response detalle raw (primer item):', response.Datos?.[0]);
        const datosTransformados: DetalleProducto[] = response.Datos.map(item => {
          const diferencia = item.VentaAnnoActual - item.VentaAnnoAnterior;
          // Extraer número de producto del Nombre (formato "21492 - CERA ROSETA...")
          const partes = (item.Nombre || '').split(' - ');
          const numero = item.Numero || (partes.length > 1 ? partes[0].trim() : '');
          const nombre = item.Numero ? item.Nombre : (partes.length > 1 ? partes.slice(1).join(' - ').trim() : item.Nombre);
          return {
            numero: numero,
            nombre: nombre,
            unidadMedida: item.UnidadMedida,
            tamanno: item.Tamanno,
            familia: item.Familia,
            ventaAnnoActual: item.VentaAnnoActual,
            ventaAnnoAnterior: item.VentaAnnoAnterior,
            unidadesAnnoActual: item.UnidadesAnnoActual,
            unidadesAnnoAnterior: item.UnidadesAnnoAnterior,
            diferencia: diferencia,
            ratio: item.VentaAnnoAnterior !== 0 ? diferencia / item.VentaAnnoAnterior : 0,
            diferenciaUnidades: item.UnidadesAnnoActual - item.UnidadesAnnoAnterior,
            fechaUltimaCompra: item.FechaUltimaCompra
          };
        });

        // Ordenar por diferencia de menor a mayor
        datosTransformados.sort((a, b) => a.diferencia - b.diferencia);

        // Calcular totales
        const totalActual = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoActual, 0);
        const totalAnterior = datosTransformados.reduce((sum, item) => sum + item.ventaAnnoAnterior, 0);
        const totalDiferencia = totalActual - totalAnterior;
        const totalUnidadesActual = datosTransformados.reduce((sum, item) => sum + item.unidadesAnnoActual, 0);
        const totalUnidadesAnterior = datosTransformados.reduce((sum, item) => sum + item.unidadesAnnoAnterior, 0);

        const filaTotal: DetalleProducto = {
          numero: '',
          nombre: 'TOTAL',
          unidadMedida: '',
          tamanno: 0,
          familia: '',
          ventaAnnoActual: totalActual,
          ventaAnnoAnterior: totalAnterior,
          unidadesAnnoActual: totalUnidadesActual,
          unidadesAnnoAnterior: totalUnidadesAnterior,
          diferencia: totalDiferencia,
          ratio: totalAnterior !== 0 ? totalDiferencia / totalAnterior : 0,
          diferenciaUnidades: totalUnidadesActual - totalUnidadesAnterior,
          fechaUltimaCompra: null
        };

        return [...datosTransformados, filaTotal];
      }),
      catchError((error) => {
        console.error('[ResumenVentasService] Error al obtener detalle de productos:', error);
        return throwError(() => new Error('No se pudo obtener el detalle de productos.'));
      })
    );
  }
}
