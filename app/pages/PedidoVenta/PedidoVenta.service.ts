import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams, Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../componentes/configuracion/configuracion';

@Injectable()
export class PedidoVentaService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

    public cargarPedido(empresa: string, numero: number): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', empresa);
        params.set('numero', numero.toString());

        return this.http.get(this._baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public modificarPedido(pedido: any): Observable<any> {
        let headers: any = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http.put(this._baseUrl, JSON.stringify(pedido), { headers: headers })
            .map(res => <Response>res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

}
