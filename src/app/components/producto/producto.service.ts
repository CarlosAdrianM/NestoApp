import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  /**
   * NestoApp#283 / NestoAPI#869: la próxima entrada de compra en Algete, aunque no haya pedido al proveedor. Devuelve el
   * `Texto` ya redactado por la API; cadena vacía si no hay nada que decir o la llamada falla (entonces no se pinta).
   */
  public cargarProximaEntrada(producto: string, almacen: string = 'ALG', empresa: string = '1'): Observable<string> {
    const params = new HttpParams()
      .set('producto', (producto || '').toString().trim())
      .set('almacen', almacen)
      .set('empresa', empresa);
    return this.http.get<any>(`${this._baseUrl}/ProximaEntrada`, { params }).pipe(
      map(r => ((r?.Texto ?? r?.texto) || '').toString().trim()),
      catchError(() => of(''))
    );
  }

  public cargarVideosProducto(productoId: string): Observable<any> {
    return this.http.get(`${Configuracion.API_URL}/Videos/Producto/${productoId}`);
  }
}
