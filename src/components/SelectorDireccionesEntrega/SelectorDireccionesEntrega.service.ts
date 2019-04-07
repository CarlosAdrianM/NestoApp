﻿import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../configuracion/configuracion';

@Injectable()
export class SelectorDireccionesEntregaService {

    constructor(private http: HttpClient) {    }

    public direccionesEntrega(cliente: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/DireccionesEntrega';
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params = params.append('clienteDirecciones', cliente);

        return this.http.get(_baseUrl, { params: params })
            .publishReplay(1)
            .refCount()
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
