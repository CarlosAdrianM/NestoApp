﻿import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Injectable()
export class ListaRapportsService {

    private usuario: any;

    constructor(private http: HttpClient, usuario: Usuario) {
        this.usuario = usuario;
    }

    private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
    
    public cargarListaFecha(fecha: string): Observable<any> {
        if (fecha.slice(-1) == "Z") {
            fecha = fecha.slice(0, -1); //si acaba en Z la quitamos
        }
        let params: HttpParams = new HttpParams();
        params = params.append('vendedor', this.usuario.vendedor);
        params = params.append('fecha', fecha);

        return this.http.get(this._baseUrl, { params })
            .catch(this.handleError);
    }

    public cargarListaCliente(cliente: string, contacto: string): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params = params.append('cliente', cliente);
        params = params.append('contacto', contacto);

        return this.http.get(this._baseUrl, { params })
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