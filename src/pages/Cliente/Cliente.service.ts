import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
import { Configuracion } from '../../components/configuracion/configuracion';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

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
    var respuesta: any = {
      nombre: cliente.nombre ? cliente.nombre.toUpperCase() :'',
      direccion: cliente.direccion ? cliente.direccion.toUpperCase() : '',
      poblacion: 'ALGETE',
      provincia: 'MADRID',
      telefono: cliente.telefono,
      vendedorEstetica: 'NV',
      vendedorPeluqueria: 'NV',
      hayErrores: false
    }
    return of(respuesta);
  }

  validarDatosPago(datosPago: any): Observable<any> {
    var respuesta: any = {
        datosPagoValidos: true,
        ibanValido: true,
        ibanFormateado: "ES12 3456 7890 1234 5678 9014"
    }
    return of(respuesta);
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.error || 'Server error');
}
}
