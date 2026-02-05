import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { ProductosBonificablesResponse, ValidarServirJuntoResponse } from '../../models/ganavisiones.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillaVentaService {

  static ngInjectableDef = undefined;

  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public crearPedido(pedido: any, saltarValidacion: boolean = false): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    // Si se quiere saltar la validación, añadir la propiedad al pedido
    const pedidoAEnviar = saltarValidacion
      ? { ...pedido, CreadoSinPasarValidacion: true }
      : pedido;

    console.log('Crear pedido - saltarValidacion:', saltarValidacion, '- CreadoSinPasarValidacion:', pedidoAEnviar.CreadoSinPasarValidacion);

    return this.http.post(this._baseUrl, JSON.stringify(pedidoAEnviar), { headers: headers });
  }

  public sePuedeServirPorGlovo(pedido: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post(this._baseUrl + "/SePuedeServirPorAgencia", JSON.stringify(pedido), { headers: headers });
  }

  public mandarCobroTarjeta(cobroTarjetaCorreo: string, cobroTarjetaMovil: string, totalPedido: number, numeroPedido: string, cliente: string) {
    var url = Configuracion.API_URL + "/ReclamacionDeuda";
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    var parametro = {
      Cliente: cliente,
      Correo: cobroTarjetaCorreo,
      Movil: cobroTarjetaMovil,
      Importe: totalPedido,
      Asunto: "Pedido " + numeroPedido + " de Nueva Visión",
      TextoSMS: "Este es un mensaje de @COMERCIO@. Puede pagar el pedido " + numeroPedido + " de @IMPORTE@ @MONEDA@ aquí: @URL@"
    }

    var parametroJson = JSON.stringify(parametro);

    return this.http.post(url, parametroJson, { headers: headers });
  }

  leerCliente(empresa: any, cliente: any, contacto: any): Observable<any> {
    var url = Configuracion.API_URL + "/Clientes/GetClienteCrear";
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get(url, { params: params });
  }

  cargarListaPendientes(empresa: any, cliente: any) {
    var url = Configuracion.API_URL + "/PlantillaVentas/PedidosPendientes";
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('clientePendientes', cliente);

    return this.http.get(url, { params: params });
  }

  public unirPedidos(empresa: string, numeroPedidoOriginal: number, pedidoAmpliacion: any): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    var url = Configuracion.API_URL + "/PedidosVenta/UnirPedidos";
    var pedido = {
      "Empresa": empresa,
      "NumeroPedidoOriginal": numeroPedidoOriginal.toString(),
      "PedidoAmpliacion": pedidoAmpliacion
    }

    return this.http.post(url, JSON.stringify(pedido), { headers: headers });
  }

  public calcularFechaEntrega(fecha: Date, ruta: string, almacen: string) {
    const formattedFecha: string = fecha.toISOString();
    var url = Configuracion.API_URL + "/PedidosVenta/FechaAjustada";
    let params: HttpParams = new HttpParams();
    params = params.append('fecha', formattedFecha);
    params = params.append('ruta', ruta);
    params = params.append('almacen', almacen);

    return this.http.get(url, { params: params });
  }

  public cargarProductosBonificables(
    empresa: string,
    baseImponibleBonificable: number,
    almacen: string,
    servirJunto: boolean,
    cliente: string
  ): Observable<ProductosBonificablesResponse> {
    const url = Configuracion.API_URL + '/Ganavisiones/ProductosBonificables';
    let params = new HttpParams()
      .set('empresa', empresa)
      .set('baseImponibleBonificable', baseImponibleBonificable.toString())
      .set('almacen', almacen)
      .set('servirJunto', servirJunto.toString())
      .set('cliente', cliente);

    return this.http.get<ProductosBonificablesResponse>(url, { params });
  }

  public validarServirJunto(
    almacen: string,
    productosBonificados: string[]
  ): Observable<ValidarServirJuntoResponse> {
    const url = Configuracion.API_URL + '/Ganavisiones/ValidarServirJunto';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { Almacen: almacen, ProductosBonificados: productosBonificados };

    return this.http.post<ValidarServirJuntoResponse>(url, body, { headers });
  }
}
