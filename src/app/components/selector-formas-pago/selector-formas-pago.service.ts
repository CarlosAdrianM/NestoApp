import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorFormasPagoService {
  constructor(private http: HttpClient) {    }

  private _baseUrl: string = Configuracion.API_URL + '/FormasPago';

  public getFormasPago(cliente: any): Observable<any[]> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      if (cliente) {
          params = params.append('cliente', cliente);
      }
      return this.http.get(this._baseUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
          
  }
  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return throwError(error.error || 'Server error');
  }
}
