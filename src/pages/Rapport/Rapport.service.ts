import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Configuracion } from '../../components/configuracion/configuracion';
import { Usuario } from '../../models/Usuario';

@Injectable()
export class RapportService {

    constructor(private http: HttpClient, private usuario: Usuario) {    }

    private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
    private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

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

    public getCliente(cliente: string, contacto: string): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params = params.append('cliente', cliente);
        params = params.append('contacto', contacto);

        return this.http.get(this._clientesUrl, { params: params })
            .catch(this.handleError);
    }

    public dejarDeVisitar(rapport: any, vendedorEstetica: string, vendedorPeluqueria: string): Observable<any> {
        let headers: any = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        let clienteCrear: any = {
            empresa: rapport.Empresa,
            cliente: rapport.Cliente,
            contacto: rapport.Contacto,
            usuario: rapport.Usuario
        }

        if (vendedorEstetica == this.usuario.vendedor) {
            clienteCrear.vendedorEstetica = Configuracion.VENDEDOR_GENERAL;
        }
        if (vendedorPeluqueria == this.usuario.vendedor) {
            clienteCrear.vendedorPeluqueria = Configuracion.VENDEDOR_GENERAL;
        }
        return this.http.put(this._clientesUrl+'/DejarDeVisitar', JSON.stringify(clienteCrear), { headers: headers })
            .catch(this.handleError);
      
    }

    private handleError(error: HttpErrorResponse): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.error || 'Server error');
    }
}
