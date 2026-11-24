import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { DondeEstaLoQueFalta } from '../models/donde-esta-lo-que-falta.model';

/** NestoApp#289: dónde está cada producto del pedido que no está listo en Algete. Solo lectura; se pide al abrir la sección. */
@Injectable({
  providedIn: 'root'
})
export class DondeEstaLoQueFaltaService {
  constructor(private http: HttpClient) { }

  /** 404 si el pedido no existe; 403 para el cliente de la tienda online. */
  public leer(empresa: string, pedido: number): Observable<DondeEstaLoQueFalta> {
    const laEmpresa = encodeURIComponent((empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim());
    return this.http.get<DondeEstaLoQueFalta>(`${Configuracion.API_URL}/PedidosVenta/${laEmpresa}/${pedido}/DondeEstaLoQueFalta`);
  }
}
