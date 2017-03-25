import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';

@Injectable()
export class RapportService {
    private http: Http;

    constructor(http: Http, private usuario: Usuario) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';

    public crearRapport(rapport: any): Observable<any> {
        let headers: any = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers })
            .map(res => <Response>res.json())
            .catch(this.handleError);
    }

    private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

    public getCliente(cliente: string, contacto: string): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        params.set('contacto', contacto);

        return this.http.get(this._clientesUrl, { search: params })
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
