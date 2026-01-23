import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';
import { Observable } from 'rxjs';
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

      let ttl = 60 * 5; // TTL in seconds (5 min)
      let cacheKey = _baseUrl + params.toString();
      let request = this.http.get(_baseUrl, { params: params });
      return this.cache.loadFromObservable(cacheKey, request, undefined, ttl);
  }

  public buscarContextual(filtro: string, operador: string): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/Buscar';
      let params: HttpParams = new HttpParams();
      params = params.append('q', filtro);
      params = params.append('usarBusquedaConAND', operador == 'AND' ? 'true' : 'false');

      let cacheKey = _baseUrl + params.toString();
      let request = this.http.get(_baseUrl, { params: params });
      return this.cache.loadFromObservable(cacheKey, request);

  }

  public buscarProductos(filtro: any): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('filtroProducto', filtro);

    let cacheKey = _baseUrl + params.toString();
    let request = this.http.get(_baseUrl, { params: params });
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
      let request = this.http.get(_baseUrl, { params: params });
      return this.cache.loadFromObservable(cacheKey, request);
  }

  ponerStocks(lineas: any[], almacen: string, ordenar: boolean, almacenes: string[] = ['ALG', 'REI', 'ALC']): Observable<any> {
    var url = Configuracion.API_URL + '/PlantillaVentas/PonerStock';
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    var parametro = {
      lineas : lineas,
      almacen : almacen,
      almacenes: almacenes,
      ordenar : ordenar
    }

    var parametroJson = JSON.stringify(parametro);

    return this.http.post(url, parametroJson, { headers: headers });
  }
}
