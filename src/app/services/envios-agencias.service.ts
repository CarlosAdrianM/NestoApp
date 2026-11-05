import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { DecisionReenvio, EnvioDevuelto, ReenviarEnvio } from '../models/envio-devuelto.model';

/** NestoApp#267 / NestoAPI#699 (corte 2): envíos devueltos y la decisión de reenviar o abonar. */
@Injectable({
  providedIn: 'root'
})
export class EnviosAgenciasService {
  constructor(private http: HttpClient) { }

  /** Los devueltos e incidentados de la empresa (últimos 60 días). Una API anterior da 404 y el llamante lo dice. */
  public leerDevueltos(empresa: string = Configuracion.EMPRESA_POR_DEFECTO): Observable<EnvioDevuelto[]> {
    const params = new HttpParams().set('empresa', (empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim());
    return this.http.get<EnvioDevuelto[]>(`${Configuracion.API_URL}/EnviosAgencias/Devueltos`, { params }).pipe(map(e => e || []));
  }

  /** El cliente lo sigue queriendo: envío nuevo del mismo pedido. 409 si ya está decidido. */
  public reenviar(envio: number, datos: ReenviarEnvio): Observable<DecisionReenvio> {
    return this.http.post<DecisionReenvio>(`${Configuracion.API_URL}/EnviosAgencias/${envio}/Reenviar`, datos);
  }

  /** El cliente no lo quiere: solo se apunta la decisión (el almacén abona). 409 si ya está decidido. */
  public abonar(envio: number): Observable<DecisionReenvio> {
    return this.http.post<DecisionReenvio>(`${Configuracion.API_URL}/EnviosAgencias/${envio}/Abonar`, null);
  }
}
