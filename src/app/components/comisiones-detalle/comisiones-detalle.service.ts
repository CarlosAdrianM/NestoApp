import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class ComisionesDetalleService {
  private _baseUrl: string = Configuracion.API_URL + '/ComisionAnualDetalles';

  constructor(private http: HttpClient) { }

  public cargarDetalle(vendedor: string, anno: number, mes: number, incluirAlbaranes: boolean, etiqueta: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('vendedor', vendedor);
    params = params.append('mes', mes.toString());
    params = params.append('anno', anno.toString());
    params = params.append('incluirAlbaranes', incluirAlbaranes ? 'true' : 'false');
    params = params.append('etiqueta', etiqueta);

    return this.http.get(this._baseUrl, { params })
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
