import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { PedidoVenta } from './pedido-venta';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoVentaService {
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public cargarPedido(empresa: string, numero: number): Observable<PedidoVenta> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('numero', numero.toString());

      return this.http.get<PedidoVenta>(this._baseUrl, { params: params });
  }

  public cargarEnlacesSeguimiento(empresa: string, numero: number): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('pedido', numero.toString());

      return this.http.get(Configuracion.API_URL+'/EnviosAgencias', { params: params });
  }

  public modificarPedido(pedido: any, saltarValidacion: boolean = false): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    // Si se quiere saltar la validación, añadir la propiedad al pedido
    const pedidoAEnviar = saltarValidacion
      ? { ...pedido, CreadoSinPasarValidacion: true }
      : pedido;

    console.log('Modificar pedido - saltarValidacion:', saltarValidacion, '- CreadoSinPasarValidacion:', pedidoAEnviar.CreadoSinPasarValidacion);

    return this.http.put(this._baseUrl, JSON.stringify(pedidoAEnviar), { headers: headers });
  }

  public cargarParametrosIva(empresa: string, ivaCabecera: string): Observable<ParametrosIva[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('ivaCabecera', ivaCabecera);

    return this.http.get<any[]>(Configuracion.API_URL + '/ParametrosIva', { params }).pipe(
      map(response => response.map(item => ({
        codigoIvaProducto: item.CodigoIvaProducto,
        porcentajeIvaProducto: item.PorcentajeIvaProducto,
        porcentajeIvaRecargoEquivalencia: item.PorcentajeIvaRecargoEquivalencia
      })))
    );
  }
}
