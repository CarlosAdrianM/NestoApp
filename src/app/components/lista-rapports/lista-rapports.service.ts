import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class ListaRapportsService {
  private usuario: any;
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient, usuario: Usuario) {
      this.usuario = usuario;
  }

  private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
  
  public cargarListaFecha(fecha: string): Observable<any> {
      if (fecha.slice(-1) == "Z") {
          fecha = fecha.slice(0, -1); //si acaba en Z la quitamos
      }
      let params: HttpParams = new HttpParams();
      if (this.usuario.vendedor) {
          params = params.append('vendedor', this.usuario.vendedor);
      } else {
          params = params.append('vendedor','');
      }
      params = params.append('fecha', fecha);

      return this.http.get(this._baseUrl, { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public cargarListaCliente(cliente: string, contacto: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);

      return this.http.get(this._baseUrl, { params })
      .pipe(
        catchError(this.handleError)
      )
}

  cargarCodigosPostalesSinVisitar(vendedor: string, forzarTodos: boolean = false) {
      var date = new Date();
      var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
      var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      if (forzarTodos) {
          ultimoDia = new Date(primerDia.getTime() - 1);
      }
      
      let params: HttpParams = new HttpParams();
      params = params.append('vendedor', vendedor);
      params = params.append('fechaDesde', primerDia.toISOString());
      params = params.append('fechaHasta', ultimoDia.toISOString());

      return this.http.get(this._baseUrl+'/GetCodigosPostalesSinVisitar', { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  cargarClientesSinVisitar(vendedor: string, codigoPostal: string) {
      var date = new Date();
      var primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
      var ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      let params: HttpParams = new HttpParams();
      params = params.append('vendedor', vendedor);
      params = params.append('codigoPostal', codigoPostal);
      params = params.append('fechaDesde', primerDia.toISOString());
      params = params.append('fechaHasta', ultimoDia.toISOString());

      return this.http.get(this._baseUrl+'/GetClientesSinVisitar', { params })
        .pipe(
          catchError(this.handleError)
        )
  }

  public cargarRapportsFiltrados(filtroBuscar: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      if (this.usuario.vendedor) {
          params = params.append('vendedor', this.usuario.vendedor);
      } else {
          params = params.append('vendedor','');
      }
      params = params.append('filtro', filtroBuscar);

      return this.http.get(this._baseUrl, { params })
        .pipe(
          catchError(this.handleError)
        )
  }
     

  private handleError(error: Response): Observable<any> {
      // in a real world app, we may send the error to some remote logging infrastructure
      // instead of just logging it to the console
      console.error(error);
      let errores: any = error;
      return throwError(errores.json().error || 'Server error');
  }
}