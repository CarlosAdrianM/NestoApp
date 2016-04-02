import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../componentes/configuracion/configuracion';

@Injectable()
export class SelectorClientesService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    private _clientesUrl: string = Configuracion.API_URL + '/Clientes?empresa=' + Configuracion.EMPRESA_POR_DEFECTO + '&filtro='; // URL to web api

    public getClientes(filtro: string): Observable<any[]> {
        return this.http.get(this._clientesUrl + filtro)
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }
    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}
