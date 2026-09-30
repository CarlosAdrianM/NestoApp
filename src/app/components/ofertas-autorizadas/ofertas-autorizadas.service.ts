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
 * NestoApp#204: de una sola vez con GET api/OfertasAutorizadas, que ya filtra por fechas y deja
 * fuera las denegaciones y las reglas de un cliente o producto concreto. Si la API todavía no lo
 * tiene, se leen los tres listados de antes en paralelo (quitando las denegaciones); si alguno
 * falla, la pantalla enseña los otros dos en vez de quedarse en blanco.
 */

/** PascalCase, como lo serializa NestoAPI (OfertasAutorizadasDTO). */
interface OfertasAutorizadasDTO {
  Combinadas?: OfertaCombinada[];
  Familias?: OfertaFamilia[];
  Escalonadas?: OfertaEscalonada[];
}
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
    const params = new HttpParams().set('empresa', this.empresa);
    return this.http.get<OfertasAutorizadasDTO>(Configuracion.API_URL + '/OfertasAutorizadas', { params }).pipe(
      map(dto => ({
        combinadas: dto?.Combinadas || [],
        familias: dto?.Familias || [],
        escalonadas: dto?.Escalonadas || []
      })),
      catchError(() => this.cargarPorSeparado())
    );
  }

  /** Respaldo para una API sin el endpoint agregado. */
  private cargarPorSeparado(): Observable<OfertasAutorizadas> {
    return forkJoin({
      combinadas: this.cargarOfertasCombinadas().pipe(catchError(() => of([] as OfertaCombinada[]))),
      familias: this.cargarOfertasFamilia().pipe(catchError(() => of([] as OfertaFamilia[]))),
      escalonadas: this.cargarOfertasEscalonadas().pipe(catchError(() => of([] as OfertaEscalonada[])))
    }).pipe(
      map(resultado => ({
        combinadas: resultado.combinadas || [],
        // NestoAPI#564: una denegación no es una oferta («lleva X y te regalamos Y» sería falso).
        familias: (resultado.familias || []).filter(f => !f.Denegar),
        escalonadas: resultado.escalonadas || []
      }))
    );
  }
}
