import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class ProductoService {
  private _baseUrl: string = Configuracion.API_URL + '/Productos';

  constructor(private http: Http) { }

  public cargar(empresa: string, id: string, fichaCompleta: boolean): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('empresa', empresa);
    params.set('id', id);
    params.set('fichaCompleta', fichaCompleta.toString());

    return this.http.get(this._baseUrl, { search: params })
      .map(res => <any[]>res.json())
      .catch(this.handleError);
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json() || 'Server error');
  }
}
