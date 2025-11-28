import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class UltimasVentasProductoClienteService {

  constructor(private http: HttpClient) {  }

  public cargarUltimasVentas(producto: string, cliente: string): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/UltimasVentasProductoCliente';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('clienteUltimasVentas', cliente);
      params = params.append('productoUltimasVentas', producto);

      return this.http.get(_baseUrl, { params: params });
  }
}
