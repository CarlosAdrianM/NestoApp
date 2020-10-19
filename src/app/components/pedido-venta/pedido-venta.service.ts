import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { PedidoVenta } from './pedido-venta';

@Injectable({
  providedIn: 'root'
})
export class PedidoVentaService {
  static ngInjectableDef = undefined;
  
  constructor(private http: HttpClient) {    }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public cargarPedido(empresa: string, numero: number): Observable<PedidoVenta> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('numero', numero.toString());

      return this.http.get(this._baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
  }
  
  public cargarEnlacesSeguimiento(empresa: string, numero: number): Observable<PedidoVenta> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('pedido', numero.toString());

      return this.http.get(Configuracion.API_URL+'/EnviosAgencias', { params: params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public modificarPedido(pedido: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      let pedidoJson: string = JSON.stringify(pedido);

      return this.http.put(this._baseUrl, pedidoJson, { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return throwError(error.error || 'Server error');
  }
}
