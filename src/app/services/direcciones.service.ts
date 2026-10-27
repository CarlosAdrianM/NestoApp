import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/** NestoAPI#306 / #578: lo que devuelve la API de una dirección, ya troceado. PascalCase, como lo serializa. */
export interface DireccionDetalle {
  Calle: string | null;
  Numero: string | null;
  CodigoPostal: string | null;
  Poblacion: string | null;
  Provincia: string | null;
  DireccionFormateada: string | null;
  Pais?: string | null;
  PaisIso?: string | null;
}

/** «Calle Mayor 3» (calle y número, sin coma, como lo rellenaba el plugin de antes). */
export function textoCalleNumero(direccion: DireccionDetalle | null | undefined): string {
  return [direccion?.Calle, direccion?.Numero].map(t => (t || '').toString().trim()).filter(t => !!t).join(' ');
}

/**
 * NestoApp#159 / NestoAPI#578: geocodificación inversa por la API (Google desde el servidor), que
 * sustituye al plugin cordova-plugin-nativegeocoder en el alta de cliente y en los códigos postales de
 * Rapports. El plugin sigue dentro del APK de los vendedores hasta el próximo binario, pero ya no se usa.
 */
@Injectable({ providedIn: 'root' })
export class DireccionesService {
  constructor(private http: HttpClient) { }

  /**
   * La dirección de unas coordenadas. null si Google no encuentra nada (404), si Google falla (502), si
   * la API es anterior o sin red: quien llama deja los campos como estaban.
   */
  public desdeCoordenadas(latitud: number, longitud: number): Observable<DireccionDetalle | null> {
    if (latitud === null || latitud === undefined || longitud === null || longitud === undefined || isNaN(+latitud) || isNaN(+longitud)) {
      return of(null);
    }
    const params = new HttpParams().set('latitud', String(latitud)).set('longitud', String(longitud));
    return this.http.get<DireccionDetalle>(`${Configuracion.API_URL}/Direcciones/DesdeCoordenadas`, { params }).pipe(
      map(direccion => direccion || null),
      catchError(() => of(null))
    );
  }
}
