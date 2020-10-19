import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorPlantillaVentaService {
  constructor(private http: HttpClient, private cache: CacheService) {}

  public getProductos(cliente: string): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);

      let ttl = 60 * 60 * 24 * 7; // TTL in seconds for one week
      let cacheKey = _baseUrl + params.toString();
      let request = this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
      return this.cache.loadFromObservable(cacheKey, request, undefined, ttl);
  }

  public buscarProductos(filtro: any): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('filtroProducto', filtro);

      let cacheKey = _baseUrl + params.toString();
      let request = this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
      return this.cache.loadFromObservable(cacheKey, request);

  }

  public comprobarCondicionesPrecio(linea: any): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/ComprobarCondiciones';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('producto', linea.producto);
      params = params.append('aplicarDescuento', linea.aplicarDescuento); 
      params = params.append('precio', linea.precio);
      params = params.append('descuento', linea.descuento);
      params = params.append('cantidad', linea.cantidad);
      params = params.append('cantidadOferta', linea.cantidadOferta);

      let cacheKey = _baseUrl + params.toString();
      let request = this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
      return this.cache.loadFromObservable(cacheKey, request);
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return throwError(error.error || 'Server error');
  }
}
