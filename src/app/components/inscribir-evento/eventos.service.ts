import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Evento, EventoCurso, InscribirEvento, InscripcionEvento } from 'src/app/models/eventos.model';

/** NestoApp#217 (NestoAPI#611): eventos e inscripciones. */
@Injectable({ providedIn: 'root' })
export class EventosService {
  constructor(private http: HttpClient) { }

  public leerEventos(empresa: string): Observable<Evento[]> {
    const params = new HttpParams().set('empresa', empresa).set('soloActivos', 'true');
    return this.http.get<Evento[]>(`${Configuracion.API_URL}/Eventos`, { params }).pipe(map(eventos => eventos || []));
  }

  /**
   * NestoApp#247: la ficha de un evento. No hay GET por Id: se busca en la lista (también los pasados y los
   * inactivos, para que la push de un evento ya cerrado no se quede en blanco). null si no está.
   */
  public leerEvento(id: number, empresa: string = '1'): Observable<Evento | null> {
    const params = new HttpParams().set('empresa', empresa).set('soloActivos', 'false');
    return this.http.get<Evento[]>(`${Configuracion.API_URL}/Eventos`, { params }).pipe(
      map(eventos => (eventos || []).find(e => +e.Id === +id) || null)
    );
  }

  /** NestoApp#244 / NestoAPI#691: los eventos futuros de un curso que se pueden vender, con sus modalidades. */
  public leerEventosPorProducto(empresa: string, producto: string): Observable<EventoCurso[]> {
    const params = new HttpParams().set('empresa', (empresa || '1').trim()).set('producto', (producto || '').trim());
    return this.http.get<EventoCurso[]>(`${Configuracion.API_URL}/Eventos/PorProducto`, { params }).pipe(map(eventos => eventos || []));
  }

  public leerInscripcionesCliente(empresa: string, cliente: string): Observable<InscripcionEvento[]> {
    return this.http.get<InscripcionEvento[]>(
      `${Configuracion.API_URL}/Clientes/${encodeURIComponent(empresa.trim())}/${encodeURIComponent(cliente.trim())}/Inscripciones`
    ).pipe(map(inscripciones => inscripciones || []));
  }

  public inscribir(eventoId: number, peticion: InscribirEvento): Observable<InscripcionEvento> {
    return this.http.post<InscripcionEvento>(`${Configuracion.API_URL}/Eventos/${eventoId}/Inscripciones`, peticion);
  }
}
