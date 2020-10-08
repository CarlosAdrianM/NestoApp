import { Injectable } from '@angular/core';
import { Usuario } from '../models/Usuario';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';


@Injectable({
  providedIn: 'root'
})
export class Parametros {

  constructor(private http: HttpClient, private usuario: Usuario) { }

  public leer(clave: string): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/ParametrosUsuario';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('usuario', this.usuario.nombre);
    params = params.append('clave', clave);

    return this.http.get(_baseUrl, { params: params }).pipe(
        catchError(this.handleError)
    );
}

  // Handle API errors
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}
