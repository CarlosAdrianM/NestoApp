import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import {
  OfertaCombinada, OfertaEscalonada, OfertaFamilia, OfertasAutorizadas
} from '../../models/ofertas-autorizadas.model';

/**
 * Issue #137 (NestoAPI#233): lee las ofertas autorizadas vigentes de las tres modalidades.
 * Mientras la API no tenga el endpoint agregado, se leen los tres listados existentes en
 * paralelo. Si alguno falla, la pantalla enseña los otros dos en vez de quedarse en blanco.
 */
@Injectable({
  providedIn: 'root'
})
export class OfertasAutorizadasService {

  constructor(private http: HttpClient) { }

  private get empresa(): string {
    return Configuracion.EMPRESA_POR_DEFECTO;
  }

  public cargarOfertasCombinadas(): Observable<OfertaCombinada[]> {
    const params = new HttpParams()
      .set('empresa', this.empresa)
      .set('soloActivas', 'true');

    return this.http.get<OfertaCombinada[]>(Configuracion.API_URL + '/OfertasCombinadas', { params });
  }

  public cargarOfertasFamilia(): Observable<OfertaFamilia[]> {
    const params = new HttpParams().set('empresa', this.empresa);

    return this.http.get<OfertaFamilia[]>(Configuracion.API_URL + '/OfertasPermitidasFamilia', { params });
  }

  public cargarOfertasEscalonadas(): Observable<OfertaEscalonada[]> {
    const params = new HttpParams()
      .set('empresa', this.empresa)
      .set('soloActivas', 'true');

    return this.http.get<OfertaEscalonada[]>(Configuracion.API_URL + '/OfertasEscalonadas', { params });
  }

  public cargarTodas(): Observable<OfertasAutorizadas> {
    return forkJoin({
      combinadas: this.cargarOfertasCombinadas().pipe(catchError(() => of([] as OfertaCombinada[]))),
      familias: this.cargarOfertasFamilia().pipe(catchError(() => of([] as OfertaFamilia[]))),
      escalonadas: this.cargarOfertasEscalonadas().pipe(catchError(() => of([] as OfertaEscalonada[])))
    }).pipe(
      map(resultado => ({
        combinadas: resultado.combinadas || [],
        familias: resultado.familias || [],
        escalonadas: resultado.escalonadas || []
      }))
    );
  }
}
