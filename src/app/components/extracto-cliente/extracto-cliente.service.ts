import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class ExtractoClienteService {
  constructor(private http: HttpClient, 
    private transfer: FileTransfer, 
    private file: File,
    private usuario: Usuario) {
    this.http = http;
  }

  private _baseUrl: string = Configuracion.API_URL + '/ExtractosCliente';

  public cargarDeuda(cliente: any): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('cliente', cliente.cliente);

      return this.http.get(this._baseUrl, { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public cargarFacturas(cliente: any): Observable<any> {
      let fechaHasta: Date = new Date();
      let fechaDesde: Date = new Date();
      fechaDesde.setMonth(fechaDesde.getMonth() - 6);
      let params: HttpParams = new HttpParams();
      //string empresa, string cliente, string tipoApunte, DateTime fechaDesde, DateTime fechaHasta
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente.cliente);
      params = params.append('tipoApunte', "1");
      params = params.append('fechaDesde', fechaDesde.toISOString());
      params = params.append('fechaHasta', fechaHasta.toISOString());

      return this.http.get(this._baseUrl, { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public cargarPedidos(cliente: any): Observable<any> {
      let params: HttpParams = new HttpParams();
      if (!this.usuario.permitirVerTodosLosPedidos) {
          params = params.append('vendedor', this.usuario.vendedor);
      } else {
          params = params.append('vendedor', '');
      }
      params = params.append('cliente', cliente.cliente);

      return this.http.get(Configuracion.API_URL+'/PedidosVenta', { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public descargarFactura(empresa: string, numeroFactura: string): Promise<any> {
    const filetransfer: FileTransferObject = this.transfer.create(); 
    const url = Configuracion.API_URL + "/Facturas?empresa="+empresa.trim()+"&numeroFactura="+numeroFactura.trim(); 
    return filetransfer.download(url, this.file.externalDataDirectory + numeroFactura.trim() + '.pdf');
  }
  
  private handleError(error: HttpErrorResponse): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      return throwError(error.error || 'Server error');
  }
}
