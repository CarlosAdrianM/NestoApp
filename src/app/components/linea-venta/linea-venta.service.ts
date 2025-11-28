import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class LineaVentaService {

  constructor(private http: HttpClient, private cache:CacheService) {
      this.http = http;
  }

  private _baseUrl: string = Configuracion.API_URL + '/Productos';

  public getProducto(producto: string, cliente: string, contacto: string, cantidad: number): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('id', producto);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);
      params = params.append('cantidad', cantidad.toString());

      let cacheKey = this._baseUrl + params.toString();
      let request = this.http.get(this._baseUrl, { params });
      return this.cache.loadFromObservable(cacheKey, request);;
  }

}
