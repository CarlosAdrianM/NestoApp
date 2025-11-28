import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from 'ionic-cache';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private _baseUrl: string = Configuracion.API_URL + '/Clientes';

  constructor(private http: HttpClient, private cache:CacheService) { }

  public validarNif(nif: string, nombre: string): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarNifNombre';
    let params: HttpParams = new HttpParams();
    params = params.append('nif', nif);
    params = params.append('nombre', nombre);

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );
  }

  validarDatosGenerales(cliente: any): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarDatosGenerales';
    let params: HttpParams = new HttpParams();
    params = params.append('direccion', cliente.direccionCalleNumero);
    params = params.append('codigoPostal', cliente.codigoPostal);
    params = params.append('telefono', cliente.telefono);

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );

  }

  validarDatosPago(datosPago: any): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/ComprobarDatosBanco';
    let params: HttpParams = new HttpParams();
    params = params.append('formaPago', datosPago.formaPago);
    params = params.append('plazosPago', datosPago.plazosPago);
    params = params.append('iban', datosPago.ibanBruto);

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );
  }

  public crearCliente(cliente: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    this.cache.clearGroup("clientes");
    return this.http.post(this._baseUrl, JSON.stringify(cliente), { headers: headers });
  }

  leerClienteCrear(empresa: string, cliente: string, contacto: string): Observable<any> {
    var urlLlamada: string = this._baseUrl+'/GetClienteCrear';
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );
  }

  public modificarCliente(cliente: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    this.cache.clearGroup("clientes");
    return this.http.put(this._baseUrl, JSON.stringify(cliente), { headers: headers });
  }

  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((result: any, key: string) => {
        // Convertir la primera letra a minúscula y manejar _ en medio del nombre
        const camelCaseKey = key.charAt(0).toLowerCase() + key.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelCaseKey] = this.toCamelCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }

}
