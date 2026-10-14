import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Evento, InscribirEvento, InscripcionEvento } from 'src/app/models/eventos.model';

/** NestoApp#217 (NestoAPI#611): eventos e inscripciones. */
@Injectable({ providedIn: 'root' })
export class EventosService {
  constructor(private http: HttpClient) { }

  public leerEventos(empresa: string): Observable<Evento[]> {
    const params = new HttpParams().set('empresa', empresa).set('soloActivos', 'true');
    return this.http.get<Evento[]>(`${Configuracion.API_URL}/Eventos`, { params }).pipe(map(eventos => eventos || []));
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
