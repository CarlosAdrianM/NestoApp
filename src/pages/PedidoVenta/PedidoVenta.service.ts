import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpParams, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import { PedidoVenta } from '../PedidoVenta/PedidoVenta';


@Injectable()
export class PedidoVentaService {

    constructor(private http: HttpClient) {    }

    private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

    public cargarPedido(empresa: string, numero: number): Observable<PedidoVenta> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', empresa);
        params = params.append('numero', numero.toString());

        return this.http.get(this._baseUrl, { params: params })
            .catch(this.handleError);
    }
    
    public cargarEnlacesSeguimiento(empresa: string, numero: number): Observable<PedidoVenta> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', empresa);
        params = params.append('pedido', numero.toString());

        return this.http.get(Configuracion.API_URL+'/EnviosAgencias', { params: params })
            .catch(this.handleError);
    }

    public modificarPedido(pedido: any): Observable<any> {
        let headers: any = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        let pedidoJson: string = JSON.stringify(pedido);

        return this.http.put(this._baseUrl, pedidoJson, { headers: headers })
            //.map(res => <Response>res)
            .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    }

}
