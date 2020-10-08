import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class PlantillaVentaService {
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient) {    }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public crearPedido(pedido: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      return this.http.post(this._baseUrl, JSON.stringify(pedido), { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  public sePuedeServirPorGlovo(pedido: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      return this.http.post(this._baseUrl+"/SePuedeServirPorAgencia", JSON.stringify(pedido), { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return Observable.throw(error.error || 'Server error');
  }
}
