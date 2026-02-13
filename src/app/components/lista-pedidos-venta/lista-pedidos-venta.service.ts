import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { File } from '@ionic-native/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class ListaPedidosVentaService {
  private usuario: any;
  static ngInjectableDef = undefined;

  constructor(
      private http: HttpClient,
      usuario: Usuario,
      private file: File
  ) {
      this.usuario = usuario;
  }

  private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';
  
  public cargarLista(mostrarPresupuestos: boolean): Observable<any> {
      let params: HttpParams = new HttpParams();
      if (this.usuario.permitirVerTodosLosPedidos) {
        params = params.append('vendedor', '');
      } else {
        params = params.append('vendedor', this.usuario.vendedor);
      }
      if (mostrarPresupuestos) {
          params = params.append('estado', "-3");
      }

      return this.http.get(this._baseUrl, { params });
  }

  public async descargarPedido(empresa: string, pedido: number): Promise<string> {
      const url = Configuracion.API_URL + "/Facturas?empresa=" + empresa.trim() + "&numeroFactura=" + pedido.toString().trim();
      const nombreArchivo = pedido.toString().trim() + '.pdf';
      const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
      await this.file.writeFile(this.file.externalDataDirectory, nombreArchivo, blob, { replace: true });
      return this.file.externalDataDirectory + nombreArchivo;
   }
}
