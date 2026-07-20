import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from '../../services/cache.service';
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
    // Issue #153 / NestoAPI#306: si la dirección viene del combo de Places, el backend
    // se salta el geocoding de validación (que daba falsos positivos con calles homónimas).
    params = params.append('direccionVerificada', cliente.direccionVerificada ? 'true' : 'false');

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );

  }

  /**
   * Issue #152/#153 (NestoAPI#306): autocompletado de direcciones vía proxy de Google Places.
   * El sessionToken (GUID por sesión de tecleo) agrupa las Sugerencias + su Detalle para la
   * facturación de Google. La API key vive solo en el servidor.
   */
  buscarSugerenciasDireccion(texto: string, sessionToken: string): Observable<any> {
    const urlLlamada: string = Configuracion.API_URL + '/Direcciones/Sugerencias';
    let params: HttpParams = new HttpParams();
    params = params.append('texto', texto);
    params = params.append('sessionToken', sessionToken);

    return this.http.get(urlLlamada, { params: params })
      .pipe(
        map(response => this.toCamelCase(response))
      );
  }

  leerDetalleDireccion(placeId: string, sessionToken: string): Observable<any> {
    const urlLlamada: string = Configuracion.API_URL + '/Direcciones/Detalle';
    let params: HttpParams = new HttpParams();
    params = params.append('placeId', placeId);
    params = params.append('sessionToken', sessionToken);

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
