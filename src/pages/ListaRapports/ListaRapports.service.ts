import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';

@Injectable()
export class ListaRapportsService {
    private http: Http;
    private usuario: any;

    constructor(http: Http, usuario: Usuario) {
        this.http = http;
        this.usuario = usuario;
    }

    private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
    
    public cargarListaFecha(fecha: string): Observable<any> {
        if (fecha.slice(-1) == "Z") {
            fecha = fecha.slice(0, -1); //si acaba en Z la quitamos
        }
        let params: URLSearchParams = new URLSearchParams();
        params.set('vendedor', this.usuario.vendedor);
        params.set('fecha', fecha);

        return this.http.get(this._baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public cargarListaCliente(cliente: string, contacto: string): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        params.set('contacto', contacto);

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