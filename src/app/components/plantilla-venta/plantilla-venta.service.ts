import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class PlantillaVentaService {
  
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient) {    }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public crearPedido(pedido: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      return this.http.post(this._baseUrl, JSON.stringify(pedido), { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  public sePuedeServirPorGlovo(pedido: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      return this.http.post(this._baseUrl+"/SePuedeServirPorAgencia", JSON.stringify(pedido), { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  public mandarCobroTarjeta(cobroTarjetaCorreo: string, cobroTarjetaMovil: string, totalPedido: number, numeroPedido: string, cliente: string) {
      var url = Configuracion.API_URL + "/ReclamacionDeuda";
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      var parametro = {
        Cliente : cliente,
        Correo : cobroTarjetaCorreo,
        Movil : cobroTarjetaMovil,
        Importe : totalPedido,
        Asunto : "Pedido " + numeroPedido + " de Nueva Visión",
        TextoSMS: "Este es un mensaje de @COMERCIO@. Puede pagar el pedido "+numeroPedido+" de @IMPORTE@ @MONEDA@ aquí: @URL@"
      }

      var parametroJson = JSON.stringify(parametro);

      return this.http.post(url, parametroJson, { headers: headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  leerCliente(empresa: any, cliente: any, contacto: any) {
    var url = Configuracion.API_URL + "/Clientes/GetClienteCrear";
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get(url, { params: params })
      .pipe(
        catchError(this.handleError)
      )
  }

  cargarListaPendientes(empresa: any, cliente: any) {
    var url = Configuracion.API_URL + "/PlantillaVentas/PedidosPendientes";
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('clientePendientes', cliente);

    return this.http.get(url, { params: params })
      .pipe(
        catchError(this.handleError)
      )
  }

  public unirPedidos(empresa: string, numeroPedidoOriginal: number, pedidoAmpliacion: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    var url = Configuracion.API_URL + "/PedidosVenta/UnirPedidos";
    var pedido = {
      "Empresa" : empresa,
      "NumeroPedidoOriginal" : numeroPedidoOriginal.toString(),
      "PedidoAmpliacion" : pedidoAmpliacion
    }
    
    return this.http.post(url, JSON.stringify(pedido), { headers: headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  public calcularFechaEntrega(fecha: Date, ruta: string, almacen: string) {
    const formattedFecha: string = fecha.toISOString(); // Formatear la fecha como cadena en el formato deseado
    var url = Configuracion.API_URL + "/PedidosVenta/FechaAjustada";
    let params: HttpParams = new HttpParams();
    params = params.append('fecha', formattedFecha);
    params = params.append('ruta', ruta);
    params = params.append('almacen', almacen);

    return this.http.get(url, { params: params })
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
