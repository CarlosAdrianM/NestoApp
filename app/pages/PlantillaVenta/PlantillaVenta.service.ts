import {Injectable} from 'angular2/core';
import {Http, Response, Headers} from 'angular2/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../componentes/configuracion/configuracion';

@Injectable()
export class PlantillaVentaService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

    public crearPedido(pedido: any): Observable<any> {
        let headers: any = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http.post(this._baseUrl, JSON.stringify(pedido), { headers: headers })
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
