import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

    return this.http.get(this._baseUrl, { params: params })
      .pipe(
        catchError(this.handleError)
      )  
    
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
    
    return this.http.get(this._baseUrl, { params: params })
    .pipe(
      catchError(this.handleError)
    )
  }

  public cargarVideosProducto(productoId: string): Observable<any> {
    return this.http.get(`${Configuracion.API_URL}/Videos/Producto/${productoId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return throwError(error.error || 'Server error');
  }
}
