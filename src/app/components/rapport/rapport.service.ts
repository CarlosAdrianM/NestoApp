import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  static ngInjectableDef = undefined;

  constructor(private http: HttpClient, private usuario: Usuario) {    }

  private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
  private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

  public crearRapport(rapport: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      if (rapport.Id == 0) {
          return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers })
            .pipe(
              catchError(this.handleError)
            )
          
      } else {
          return this.http.put(this._baseUrl, JSON.stringify(rapport), { headers: headers })
            .pipe(
              catchError(this.handleError)
            )
      }        
  }

  public getCliente(cliente: string, contacto: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);

      return this.http.get(this._clientesUrl, { params: params })
        .pipe(
          catchError(this.handleError)
        )
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
        .pipe(
          catchError(this.handleError)
        )
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return throwError(error.error || 'Server error');
  }

}
