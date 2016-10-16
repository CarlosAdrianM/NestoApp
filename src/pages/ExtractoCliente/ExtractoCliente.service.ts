import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';

@Injectable()
export class ExtractoClienteService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/ExtractosCliente';

    public cargarDeuda(cliente: any): Observable<any> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('cliente', cliente.cliente);

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
