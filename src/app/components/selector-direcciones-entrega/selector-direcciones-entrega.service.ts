import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorDireccionesEntregaService {

  constructor(private http: HttpClient) {    }

  public direccionesEntrega(cliente: any, totalPedido: number = 0): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/DireccionesEntrega';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('clienteDirecciones', cliente);
      params = params.append('totalPedido', totalPedido.toString());

      return this.http.get(_baseUrl, { params: params }).pipe(
        publishReplay(1),
        refCount()
      );
  }
}
