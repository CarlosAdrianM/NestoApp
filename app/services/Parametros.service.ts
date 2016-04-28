import {Injectable} from 'angular2/core';
import {Configuracion} from '../componentes/configuracion/configuracion';
import {Usuario} from '../models/Usuario';
import {Http, Response, URLSearchParams} from 'angular2/http';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class Parametros {
    private http: Http;
    private usuario: Usuario;
    constructor(http: Http, usuario: Usuario) {
        this.http = http;
        this.usuario = usuario;
    }

    public leer(clave: string): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/ParametrosUsuario';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('usuario', this.usuario.nombre);
        params.set('clave', clave);

        return this.http.get(_baseUrl, { search: params })
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}