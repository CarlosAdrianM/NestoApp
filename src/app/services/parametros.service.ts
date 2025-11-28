import { Injectable } from '@angular/core';
import { Usuario } from '../models/Usuario';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { ErrorHandlerService } from './error-handler.service';
import { ProcessedApiError } from '../models/api-error.model';


@Injectable({
  providedIn: 'root'
})
export class Parametros {

  constructor(
    private http: HttpClient,
    private usuario: Usuario,
    private errorHandler: ErrorHandlerService
  ) { }

  public leer(clave: string): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/ParametrosUsuario';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('usuario', this.usuario.nombre);
    params = params.append('clave', clave);

    return this.http.get(_baseUrl, { params: params }).pipe(
        catchError((error: ProcessedApiError) => {
          this.errorHandler.handleApiError(error);
          return throwError(() => error);
        })
    );
  }
}
