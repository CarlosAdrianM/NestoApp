import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { PlazoPago, PlazosPagoResponse, InfoDeudaCliente } from 'src/app/models/plazo-pago.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelectorPlazosPagoService {
  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/PlazosPago';

  public getPlazosPago(cliente: any, formaPago: string = "", totalPedido: number = 0): Observable<PlazoPago[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    if (cliente) {
      params = params.append('cliente', cliente);
    }
    if (formaPago && totalPedido) {
      params = params.append('formaPago', formaPago);
      params = params.append('totalPedido', totalPedido.toString());
    }
    return this.http.get<PlazoPago[]>(this._baseUrl, { params: params });
  }

  public getPlazosPagoConInfoDeuda(cliente: any): Observable<PlazosPagoResponse> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    if (cliente) {
      params = params.append('cliente', cliente);
    }

    return this.http.get<any>(this._baseUrl + '/ConInfoDeuda', { params: params }).pipe(
      map(response => {
        // El servidor devuelve PascalCase, mapeamos a camelCase
        return {
          plazosPago: response.PlazosPago || response.plazosPago || [],
          infoDeuda: response.InfoDeuda ? {
            tieneDeudaVencida: response.InfoDeuda.TieneDeudaVencida,
            importeDeudaVencida: response.InfoDeuda.ImporteDeudaVencida,
            diasVencimiento: response.InfoDeuda.DiasVencimiento,
            tieneImpagados: response.InfoDeuda.TieneImpagados,
            importeImpagados: response.InfoDeuda.ImporteImpagados,
            motivoRestriccion: response.InfoDeuda.MotivoRestriccion
          } : null
        } as PlazosPagoResponse;
      })
    );
  }
}
