import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../components/configuracion/configuracion';

@Injectable()
export class SelectorFormasPagoService {
    constructor(private http: HttpClient) {    }

    private _baseUrl: string = Configuracion.API_URL + '/FormasPago';

    public getFormasPago(cliente: any): Observable<any[]> {
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
