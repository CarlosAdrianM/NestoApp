import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Injectable()
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
            .catch(this.handleError);
    }
    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        let errores: any = error;
        return Observable.throw(errores.json().error || 'Server error');
    }
}
