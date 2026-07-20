import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { LineaPortesServirJunto, ProductoBonificadoConCantidad, ProductosBonificablesResponse, ValidarServirJuntoRequest, ValidarServirJuntoResponse } from '../../models/ganavisiones.model';
import { SolicitudPagoTPV, RespuestaIniciarPago } from '../../models/pago-tpv.model';

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

  public unirPedidos(empresa: string, numeroPedidoOriginal: number, pedidoAmpliacion: any, saltarValidacion: boolean = false): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    var url = Configuracion.API_URL + "/PedidosVenta/UnirPedidos";

    // Issue #156 / NestoAPI#324: al forzar, el flag viaja en la ampliación y el
    // servidor lo propaga al pedido original y al PUT interno de la unión.
    const ampliacionAEnviar = saltarValidacion
      ? { ...pedidoAmpliacion, CreadoSinPasarValidacion: true }
      : pedidoAmpliacion;

    var pedido = {
      "Empresa": empresa,
      "NumeroPedidoOriginal": numeroPedidoOriginal.toString(),
      "PedidoAmpliacion": ampliacionAEnviar
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
    // Issue #126: incluirBloqueados=true para mostrar también los que aún no se pueden canjear
    // pero faltan pocos euros (el backend ya filtra los sin stock).
    let params = new HttpParams()
      .set('empresa', empresa)
      .set('baseImponibleBonificable', baseImponibleBonificable.toString())
      .set('almacen', almacen)
      .set('servirJunto', servirJunto.toString())
      .set('cliente', cliente)
      .set('incluirBloqueados', 'true');

    return this.http.get<ProductosBonificablesResponse>(url, { params });
  }

  public crearPago(solicitud: SolicitudPagoTPV): Observable<RespuestaIniciarPago> {
    const url = Configuracion.API_URL + '/Pagos';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<RespuestaIniciarPago>(url, solicitud, { headers });
  }

  public calcularPortes(input: any): Observable<any> {
    const url = Configuracion.API_URL + '/PedidosVenta/CalcularPortes';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(url, JSON.stringify(input), { headers });
  }

  public validarServirJunto(
    almacen: string,
    productosBonificadosConCantidad: ProductoBonificadoConCantidad[],
    lineasPedido: ProductoBonificadoConCantidad[],
    datosPedido?: {
      formaPago?: string;
      plazosPago?: string;
      ccc?: string;
      periodoFacturacion?: string;
      notaEntrega?: boolean;
    },
    lineasParaPortes?: LineaPortesServirJunto[]
  ): Observable<ValidarServirJuntoResponse> {
    const url = Configuracion.API_URL + '/PedidosVenta/ValidarServirJunto';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body: ValidarServirJuntoRequest = {
      Almacen: almacen,
      ProductosBonificadosConCantidad: productosBonificadosConCantidad,
      LineasPedido: lineasPedido,
      LineasParaPortes: lineasParaPortes,
      FormaPago: datosPedido?.formaPago,
      PlazosPago: datosPedido?.plazosPago,
      CCC: datosPedido?.ccc,
      PeriodoFacturacion: datosPedido?.periodoFacturacion,
      NotaEntrega: datosPedido?.notaEntrega
    };

    return this.http.post<ValidarServirJuntoResponse>(url, body, { headers });
  }

  public crearEtiquetaPendiente(
    empresa: string,
    pedido: number,
    agencia: number,
    retorno: number
  ): Observable<any> {
    const url = Configuracion.API_URL + '/EnviosAgencias/CrearEtiquetaPendiente';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { Empresa: empresa, Pedido: pedido, Agencia: agencia, Retorno: retorno };
    return this.http.post(url, body, { headers });
  }
}
