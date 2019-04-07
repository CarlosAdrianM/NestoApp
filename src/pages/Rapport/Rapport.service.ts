import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class RapportService {

    constructor(private http: HttpClient) {    }

    private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';

    public crearRapport(rapport: any): Observable<any> {
        let headers: any = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');

        if (rapport.Id == 0) {
            return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers })
                .catch(this.handleError);
        } else {
            return this.http.put(this._baseUrl, JSON.stringify(rapport), { headers: headers })
                .catch(this.handleError);
        }
        
    }

    private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

    public getCliente(cliente: string, contacto: string): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params = params.append('cliente', cliente);
        params = params.append('contacto', contacto);

        return this.http.get(this._clientesUrl, { params: params })
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
