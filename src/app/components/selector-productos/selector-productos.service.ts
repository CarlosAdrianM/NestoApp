import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorProductosService {
  constructor(private http: HttpClient) { };

  private _consultaUrl: string = Configuracion.API_URL + '/Productos';

  public getProductos(filtro: string): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('filtroProducto', filtro);

    return this.http.get(_baseUrl, { params: params })
      .pipe(
        catchError(this.handleError)
      )
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    let errores: any = error;
    return Observable.throw(errores.json().error || 'Server error');
  }
}
