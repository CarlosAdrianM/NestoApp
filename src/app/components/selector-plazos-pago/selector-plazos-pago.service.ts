import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorPlazosPagoService {
  constructor(private http: HttpClient, private usuario: Usuario) {    }

  private _baseUrl: string = Configuracion.API_URL + '/PlazosPago'

  public getPlazosPago(cliente: any): Observable<any[]> {
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
  private handleError(error: Response): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      let errores: any = error;
      return Observable.throw(errores.json().error || 'Server error');
  }
}
