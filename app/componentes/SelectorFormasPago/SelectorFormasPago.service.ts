import {Injectable} from 'angular2/core';
import {Http, Response, URLSearchParams} from 'angular2/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../componentes/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Injectable()
export class SelectorFormasPagoService {
    private http: Http;
    private usuario: Usuario;

    constructor(http: Http, usuario: Usuario) {
        this.http = http;
        this.usuario = usuario;
    }

    private _baseUrl: string = Configuracion.API_URL + '/FormasPago'

    public getFormasPago(cliente: any): Observable<any[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        if (cliente) {
            params.set('cliente', cliente);
        }
        return this.http.get(this._baseUrl, { search: params })
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
