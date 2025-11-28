import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ReclamacionDeuda } from 'src/app/models/ReclamacionDeuda';

@Injectable({
  providedIn: 'root'
})
export class ExtractoClienteService {
  constructor(
    private http: HttpClient,
    private transfer: FileTransfer,
    private file: File,
    private usuario: Usuario
  ) { }

  private _baseUrl: string = Configuracion.API_URL + '/ExtractosCliente';

  public cargarDeuda(cliente: any): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('cliente', cliente.cliente);

    return this.http.get(this._baseUrl, { params });
  }

  public cargarFacturas(cliente: any): Observable<any> {
    let fechaHasta: Date = new Date();
    let fechaDesde: Date = new Date();
    fechaDesde.setMonth(fechaDesde.getMonth() - 6);
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params = params.append('cliente', cliente.cliente);
    params = params.append('tipoApunte', "1");
    params = params.append('fechaDesde', fechaDesde.toISOString());
    params = params.append('fechaHasta', fechaHasta.toISOString());

    return this.http.get(this._baseUrl, { params });
  }

  public cargarPedidos(cliente: any): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (!this.usuario.permitirVerTodosLosPedidos) {
      params = params.append('vendedor', this.usuario.vendedor);
    } else {
      params = params.append('vendedor', '');
    }
    params = params.append('cliente', cliente.cliente);

    return this.http.get(Configuracion.API_URL + '/PedidosVenta', { params });
  }

  public descargarFactura(empresa: string, numeroFactura: string): Promise<any> {
    const filetransfer: FileTransferObject = this.transfer.create();
    const url = Configuracion.API_URL + "/Facturas?empresa=" + empresa.trim() + "&numeroFactura=" + numeroFactura.trim();
    return filetransfer.download(url, this.file.externalDataDirectory + numeroFactura.trim() + '.pdf');
  }

  public leerCliente(empresa: any, cliente: any, contacto: any): Observable<any> {
    const url = Configuracion.API_URL + "/Clientes/GetClienteCrear";
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get(url, { params: params });
  }

  public mandarEnlaceCobro(cliente: string, correo: string, movil: string, importe: number, asunto: string, textoSMS: string): Observable<ReclamacionDeuda> {
    const url = Configuracion.API_URL + "/ReclamacionDeuda";
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');

    const parametro = {
      Cliente: cliente,
      Correo: correo,
      Movil: movil,
      Importe: importe,
      Asunto: asunto,
      TextoSMS: textoSMS
    };

    return this.http.post<ReclamacionDeuda>(url, JSON.stringify(parametro), { headers: headers });
  }
}
