import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
//import { Configuracion } from '../../components/configuracion/configuracion';

@Injectable()
export class ClienteService {
  //private _baseUrl: string = Configuracion.API_URL + '/Cliente';

  constructor() { }

  public validarNif(nif: string): Observable<any> {
    var respuesta: any =  {
        nifValidado: true,
        existeElCliente: true
    };
    return Observable.of(respuesta);
  }

  validarDatosGenerales(cliente: any): Observable<any> {
    var respuesta: any = {
      nombre: cliente.nombre.toUpperCase(),
      direccion: cliente.direccion.toUpperCase(),
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
        ibanValido: false,
        ibanFormateado: "ES1234567890123456789012"
    }
    return of(respuesta);
  }
}
