import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorPlantillaVentaService {
  constructor(private http: HttpClient) {}

  public getProductos(cliente: string): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);

      return this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public buscarProductos(filtro: any): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('filtroProducto', filtro);

      return this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
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

      return this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
  }

  private handleError(error: Response): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      let errores : any = error;
      return Observable.throw(errores.json().error || 'Server error');
  }
}
