import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorPlantillaVentaDetalleService {

  constructor(private http: HttpClient) { }

  public cargarStockProducto(producto: any, almacen: any): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/CargarStocks';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('almacen', almacen);
      params = params.append('productoStock', producto.producto);

      return this.http.get(_baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public actualizarPrecioProducto(producto: any, cliente: any): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/CargarPrecio';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('cliente', cliente);
    params = params.append('contacto', '0'); // porque aún no sabemos la dirección de entrega
    params = params.append('productoPrecio', producto.producto);
    params = params.append('cantidad', producto.cantidad);
    params = params.append('aplicarDescuento', producto.aplicarDescuento); //¿aplicarDescuentoFicha?
    // params = params.append('aplicarDescuento', producto.cantidadOferta === 0  ? producto.aplicarDescuento : false);

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
