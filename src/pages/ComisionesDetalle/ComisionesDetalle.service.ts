import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class ComisionesDetalleService {
  private _baseUrl: string = Configuracion.API_URL + '/ComisionAnualDetalles';

  constructor(private http: Http) { }

  public cargarDetalle(vendedor: string, anno: number, mes: number, incluirAlbaranes: boolean, etiqueta: string): Observable<any> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('vendedor', vendedor);
    params.set('mes', mes.toString());
    params.set('anno', anno.toString());
    params.set('incluirAlbaranes', incluirAlbaranes ? 'true' : 'false');
    params.set('etiqueta', etiqueta);

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
