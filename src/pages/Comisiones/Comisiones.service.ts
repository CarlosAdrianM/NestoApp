import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class ComisionesService {
  private _baseUrl: string = Configuracion.API_URL + '/Comisiones';

  constructor(private http: HttpClient) { }

  public cargarResumen(vendedor: string, mes: number, anno: number, incluirAlbaranes: boolean): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('vendedor', vendedor);
    params = params.append('mes', mes.toString());
    params = params.append('anno', anno.toString());
    params = params.append('incluirAlbaranes', incluirAlbaranes ? 'true' : 'false');

    return this.http.get(this._baseUrl, { params })
      .catch(this.handleError);
  }

  public cargarPrueba(): any {
    return { "$id": "1", "Vendedor": "IF", "Anno": 2018, "Mes": 3, "Etiquetas": [{ "$id": "2", "Nombre": "General", "Venta": 6656.2100, "Tipo": 0.072, "Comision": 479.25 }, { "$id": "3", "Nombre": "Lisap", "Venta": 3423.5300, "Tipo": 0.008, "Comision": 27.39 }], "GeneralFaltaParaSalto": 368.79, "GeneralProyeccion": 66562.1000, "TotalComisiones": 506.64 };
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json() || 'Server error');
  }

}
