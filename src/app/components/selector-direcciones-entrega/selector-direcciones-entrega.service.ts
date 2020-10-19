import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, publishReplay, refCount } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorDireccionesEntregaService {

  constructor(private http: HttpClient) {    }

  public direccionesEntrega(cliente: any): Observable<any> {
      let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/DireccionesEntrega';
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('clienteDirecciones', cliente);

      return this.http.get(_baseUrl, { params: params }).pipe(
        publishReplay(1),
        refCount(),
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
