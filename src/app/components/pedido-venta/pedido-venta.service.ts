import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { PedidoVenta } from './pedido-venta';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';
import { CambiarClientePedidoPeticion, CambiarClientePedidoRespuesta } from 'src/app/models/cambio-cliente-pedido.model';

/**
 * Issue #200 (NestoAPI#494): con Agencia = 0, CrearEtiquetaPendiente deja que el comparador
 * elija la agencia en el modo del retorno (envío + retorno para «Recoger producto»). Sin
 * ninguna con precio, GLS, como antes.
 */
export const AGENCIA_LA_ELIGE_EL_COMPARADOR = 0;

/**
 * NestoApp#197 / NestoAPI#542: campos que la API devuelve pero que solo escribe ella (el picking,
 * la factura o la nota de entrega automática). No se mandan nunca al guardar.
 */
const CAMPOS_SOLO_LECTURA = ['recoger', 'yaFacturado', 'pedidoOrigen', 'albaranOrigen'];

export function sinCamposSoloLectura(clave: string, valor: any): any {
  return CAMPOS_SOLO_LECTURA.includes(clave) ? undefined : valor;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoVentaService {
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';

  public cargarPedido(empresa: string, numero: number): Observable<PedidoVenta> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('numero', numero.toString());

      return this.http.get<PedidoVenta>(this._baseUrl, { params: params });
  }

  public cargarEnlacesSeguimiento(empresa: string, numero: number): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', empresa);
      params = params.append('pedido', numero.toString());

      return this.http.get(Configuracion.API_URL+'/EnviosAgencias', { params: params });
  }

  // Actualiza a demanda el estado de UN envío contra su agencia (sin esperar al job cada 2h).
  // 'numeroEnvio' es el EnviosAgencia.Numero (campo Numero del DTO). Devuelve el seguimiento
  // (Estado/FechaEntrega/Detalle); tras llamarlo conviene recargar cargarEnlacesSeguimiento.
  public actualizarSeguimientoEnvio(numeroEnvio: number): Observable<any> {
      const url = Configuracion.API_URL + '/EnviosAgencias/' + numeroEnvio + '/ActualizarSeguimiento';
      return this.http.post(url, null);
  }

  public modificarPedido(pedido: any, saltarValidacion: boolean = false): Observable<any> {
    let headers: any = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    // Si se quiere saltar la validación, añadir la propiedad al pedido
    const pedidoAEnviar = saltarValidacion
      ? { ...pedido, CreadoSinPasarValidacion: true }
      : pedido;

    console.log('Modificar pedido - saltarValidacion:', saltarValidacion, '- CreadoSinPasarValidacion:', pedidoAEnviar.CreadoSinPasarValidacion);

    return this.http.put(this._baseUrl, JSON.stringify(pedidoAEnviar, sinCamposSoloLectura), { headers: headers });
  }

  /** NestoApp#198 / NestoAPI#519: pasa el pedido guardado a otro cliente y lo recalcula. */
  public cambiarCliente(empresa: string, numero: number, peticion: CambiarClientePedidoPeticion): Observable<CambiarClientePedidoRespuesta> {
    const url = `${this._baseUrl}/${encodeURIComponent((empresa || '1').trim())}/${numero}/CambiarCliente`;
    return this.http.post<CambiarClientePedidoRespuesta>(url, peticion);
  }

  // Crea una etiqueta de recogida pendiente (EnviosAgencia con Retorno=1, Estado<0).
  // Para "Recoger Producto" se usa Agencia=0, Retorno=1 (igual que plantilla-venta).
  // El backend responde 409 si ya existe otra etiqueta pendiente del pedido.
  public crearEtiquetaPendiente(empresa: string, pedido: number, agencia: number, retorno: number): Observable<any> {
    const url = Configuracion.API_URL + '/EnviosAgencias/CrearEtiquetaPendiente';
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { Empresa: empresa, Pedido: pedido, Agencia: agencia, Retorno: retorno };
    return this.http.post(url, body, { headers });
  }

  // Cancela una etiqueta pendiente. 'numeroEnvio' es el EnviosAgencia.Numero (campo Numero
  // del DTO). El backend solo la borra si Estado<0 (pendiente).
  public cancelarEtiquetaPendiente(numeroEnvio: number): Observable<any> {
    return this.http.delete(Configuracion.API_URL + '/EnviosAgencias/' + numeroEnvio);
  }

  public cargarParametrosIva(empresa: string, ivaCabecera: string): Observable<ParametrosIva[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('ivaCabecera', ivaCabecera);

    return this.http.get<any[]>(Configuracion.API_URL + '/ParametrosIva', { params }).pipe(
      map(response => response.map(item => ({
        codigoIvaProducto: item.CodigoIvaProducto,
        porcentajeIvaProducto: item.PorcentajeIvaProducto,
        porcentajeIvaRecargoEquivalencia: item.PorcentajeIvaRecargoEquivalencia
      })))
    );
  }
}
