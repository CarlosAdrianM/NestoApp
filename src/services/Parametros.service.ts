import {Injectable} from '@angular/core';
import {Configuracion} from '../components/configuracion/configuracion';
import {Usuario} from '../models/Usuario';
import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class Parametros {
    
    
    constructor(private http: HttpClient, private usuario: Usuario) {}

    public leer(clave: string): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/ParametrosUsuario';
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params = params.append('usuario', this.usuario.nombre);
        params = params.append('clave', clave);

        return this.http.get(_baseUrl, { params: params })
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