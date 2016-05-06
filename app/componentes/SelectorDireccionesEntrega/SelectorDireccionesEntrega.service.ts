﻿import {Injectable} from 'angular2/core';
import {Http, Response, URLSearchParams} from 'angular2/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../configuracion/configuracion';

@Injectable()
export class SelectorDireccionesEntregaService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    public direccionesEntrega(cliente: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/DireccionesEntrega';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('clienteDirecciones', cliente);

        return this.http.get(_baseUrl, { search: params })
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