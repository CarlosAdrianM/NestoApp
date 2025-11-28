import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { FormaPago } from 'src/app/models/forma-pago.model';

@Injectable({
  providedIn: 'root'
})
export class SelectorFormasPagoService {
  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/FormasPago';

  public getFormasPago(cliente: any, totalPedido: number = 0, tipoIva: string = ""): Observable<FormaPago[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    if (cliente) {
      params = params.append('cliente', cliente);
      if (totalPedido > 1000) {
        params = params.append('totalPedido', totalPedido.toString());
        params = params.append('tipoIva', tipoIva);
      }
    }
    return this.http.get<FormaPago[]>(this._baseUrl, { params: params });
  }
}
