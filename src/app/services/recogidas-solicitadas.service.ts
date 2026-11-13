import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { RecogidaSolicitada, SolicitarRecogida } from '../models/recogida-solicitada.model';

/** NestoApp#259 / NestoAPI#855: el vendedor solicita una recogida y el almacén la confirma en Nesto. */
@Injectable({
  providedIn: 'root'
})
export class RecogidasSolicitadasService {
  private readonly url = `${Configuracion.API_URL}/NotasEntrega/Recogidas/Solicitudes`;

  constructor(private http: HttpClient) { }

  /** Las del cliente (y contacto), la más reciente primero. */
  public leer(empresa: string, cliente: string, contacto?: string | null): Observable<RecogidaSolicitada[]> {
    let params = new HttpParams()
      .set('empresa', (empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim())
      .set('cliente', (cliente || '').toString().trim());
    if ((contacto ?? '').toString().trim()) {
      params = params.set('contacto', contacto.toString().trim());
    }
    return this.http.get<RecogidaSolicitada[]>(this.url, { params }).pipe(map(lista => lista || []));
  }

  /** 201 con la solicitud. 400 / 403 / 404 / 409 / 503 con { Message }. */
  public solicitar(solicitud: SolicitarRecogida): Observable<RecogidaSolicitada> {
    const cuerpo: SolicitarRecogida = {
      ...solicitud,
      Empresa: (solicitud.Empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim(),
      Cliente: (solicitud.Cliente || '').toString().trim(),
      Contacto: (solicitud.Contacto || '').toString().trim(),
      Texto: (solicitud.Texto || '').trim(),
      FacturaOriginal: (solicitud.FacturaOriginal || '').trim() || null
    };
    return this.http.post<RecogidaSolicitada>(this.url, cuerpo);
  }

  /** 200 con la solicitud «Anulada». 403 si ya está en marcha; 409 si ya está resuelta. */
  public anular(id: number, motivo?: string | null): Observable<RecogidaSolicitada> {
    let params = new HttpParams();
    if ((motivo || '').trim()) {
      params = params.set('motivo', motivo.trim());
    }
    return this.http.delete<RecogidaSolicitada>(`${this.url}/${id}`, { params });
  }
}
