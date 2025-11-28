import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  static ngInjectableDef = undefined;
  private _baseUrl: string = Configuracion.API_URL + '/Productos';

  constructor(private http: HttpClient, private usuario: Usuario) { }

  public cargar(empresa: string, id: string, fichaCompleta: boolean): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('id', id);
    params = params.append('fichaCompleta', fichaCompleta.toString());

    return this.http.get(this._baseUrl, { params: params });
  }

  public cargarClientes(empresa: string, id: string): Observable<any> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('id', id);
    if (!this.usuario.permitirVerClientesTodosLosVendedores) {
      params = params.append('vendedor', this.usuario.vendedor);
    } else {
      params = params.append('vendedor', '');
    }

    return this.http.get(this._baseUrl, { params: params });
  }

  public cargarVideosProducto(productoId: string): Observable<any> {
    return this.http.get(`${Configuracion.API_URL}/Videos/Producto/${productoId}`);
  }
}
