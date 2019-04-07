import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';

@Injectable()
export class PlantillaVentaService {

    constructor(private http: HttpClient) {    }

    private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

    public crearPedido(pedido: any): Observable<any> {
        let headers: any = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');

        return this.http.post(this._baseUrl, JSON.stringify(pedido), { headers: headers })
            .catch(this.handleError);
    }

    public sePuedeServirPorGlovo(pedido: any): Observable<any> {
        let headers: any = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');

        return this.http.post(this._baseUrl+"/SePuedeServirPorAgencia", JSON.stringify(pedido), { headers: headers })
            .catch(this.handleError);
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    }

}
