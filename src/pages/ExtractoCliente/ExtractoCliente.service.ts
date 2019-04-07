import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';

@Injectable()
export class ExtractoClienteService {

    constructor(private http: HttpClient) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/ExtractosCliente';

    public cargarDeuda(cliente: any): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('cliente', cliente.cliente);

        return this.http.get(this._baseUrl, { params })
            .catch(this.handleError);
    }
    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    }

}
