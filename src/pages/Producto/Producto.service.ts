import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class ProductoService {
  private _baseUrl: string = Configuracion.API_URL + '/Productos';

  constructor(private http: HttpClient) { }

  public cargar(empresa: string, id: string, fichaCompleta: boolean): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('id', id);
    params = params.append('fichaCompleta', fichaCompleta.toString());

    return this.http.get(this._baseUrl, { params: params })
      .catch(this.handleError);
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json() || 'Server error');
  }
}
