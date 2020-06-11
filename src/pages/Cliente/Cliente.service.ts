import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
import { Configuracion } from '../../components/configuracion/configuracion';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ClienteService {
    
  private _baseUrl: string = Configuracion.API_URL + '/Clientes';

  constructor(private http: HttpClient) { }

  public validarNif(nif: string, nombre: string): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarNifNombre';
    let params: HttpParams = new HttpParams();
    params = params.append('nif', nif);
    params = params.append('nombre', nombre);

    return this.http.get(urlLlamada, { params: params })
        .catch(this.handleError);
  }

  validarDatosGenerales(cliente: any): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarDatosGenerales';
    let params: HttpParams = new HttpParams();
    params = params.append('direccion', cliente.direccionCalleNumero);
    params = params.append('codigoPostal', cliente.codigoPostal);
    params = params.append('telefono', cliente.telefono);

    return this.http.get(urlLlamada, { params: params })
        .catch(this.handleError);

  }

  validarDatosPago(datosPago: any): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarDatosBanco';
    let params: HttpParams = new HttpParams();
    params = params.append('formaPago', datosPago.formaPago);
    params = params.append('plazosPago', datosPago.plazosPago);
    params = params.append('iban', datosPago.ibanBruto);

    return this.http.get(urlLlamada, { params: params })
        .catch(this.handleError);
  }

  public crearCliente(cliente: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post(this._baseUrl, JSON.stringify(cliente), { headers: headers })
        .catch(this.handleError);
  }

  leerClienteCrear(empresa: string, cliente: string, contacto: string): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/GetClienteCrear';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get(urlLlamada, { params: params })
        .catch(this.handleError);
  }

  public modificarCliente(cliente: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.put(this._baseUrl, JSON.stringify(cliente), { headers: headers })
        .catch(this.handleError);
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.error || 'Server error');
}
}
