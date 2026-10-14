import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from '../../services/cache.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { SugerenciasContactoRespuesta, VendedorVisible } from 'src/app/models/sugerencias-contacto.model';
import { ChequeRegaloPendiente, ResumenChequesRegalo } from 'src/app/models/cheques-regalo-vendedor.model';

@Injectable({
  providedIn: 'root'
})
export class ListaRapportsService {
  private usuario: any;
  static ngInjectableDef = undefined;

  constructor(private http: HttpClient, usuario: Usuario, private cache: CacheService) {
      this.usuario = usuario;
  }

  private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
  
  public cargarListaFecha(fecha: string): Observable<any> {
      if (fecha.slice(-1) == "Z") {
          fecha = fecha.slice(0, -1); //si acaba en Z la quitamos
      }
      let params: HttpParams = new HttpParams();
      if (!this.usuario.permitirVerTodosLosPedidos) {
          params = params.append('vendedor', this.usuario.vendedor);
      } else {
          params = params.append('vendedor','');
      }
      params = params.append('fecha', fecha);

      const ttl = 10; // TTL in seconds
      const cacheKey = this._baseUrl + params.toString();
      const request = this.http.get(this._baseUrl, { params: params });
      return this.cache.loadFromObservable(cacheKey, request, undefined, ttl);
  }

  public cargarListaCliente(cliente: string, contacto: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);

      return this.http.get(this._baseUrl, { params });
}

  cargarCodigosPostalesSinVisitar(vendedor: string, forzarTodos: boolean = false): Observable<any[]> {
      const date = new Date();
      const primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
      let ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      if (forzarTodos) {
          ultimoDia = new Date(primerDia.getTime() - 1);
      }

      let params: HttpParams = new HttpParams();
      params = params.append('vendedor', vendedor);
      params = params.append('fechaDesde', primerDia.toISOString());
      params = params.append('fechaHasta', ultimoDia.toISOString());

      return this.http.get<any[]>(this._baseUrl+'/GetCodigosPostalesSinVisitar', { params });
  }

  cargarClientesSinVisitar(vendedor: string, codigoPostal: string): Observable<any[]> {
      const date = new Date();
      const primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
      const ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      let params: HttpParams = new HttpParams();
      params = params.append('vendedor', vendedor);
      params = params.append('codigoPostal', codigoPostal);
      params = params.append('fechaDesde', primerDia.toISOString());
      params = params.append('fechaHasta', ultimoDia.toISOString());

      return this.http.get<any[]>(this._baseUrl+'/GetClientesSinVisitar', { params });
  }

  public cargarRapportsFiltrados(filtroBuscar: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      if (!this.usuario.permitirVerTodosLosPedidos) {
          params = params.append('vendedor', this.usuario.vendedor);
      } else {
          params = params.append('vendedor','');
      }
      params = params.append('filtro', filtroBuscar);

      return this.http.get(this._baseUrl, { params });
  }

  /**
   * NestoApp#212 / NestoAPI#603: clientes para contactar hoy y ritmo del vendedor. La lista es fija
   * durante el día (la primera consulta la registra). Devuelve null si la API publicada no tiene el
   * endpoint (404), para que la pantalla lo diga en vez de dar un error.
   */
  public cargarSugerenciasContacto(vendedor: string): Observable<SugerenciasContactoRespuesta | null> {
      let params: HttpParams = new HttpParams();
      params = params.append('vendedor', vendedor);
      params = params.append('tipoInteraccion', ''); // vacío = llamada, como en Nesto
      params = params.append('numero', '20');
      params = params.append('grupoSubgrupo', '');

      return this.http.get<SugerenciasContactoRespuesta>(Configuracion.API_URL + '/Clientes/SugerenciasContacto', { params }).pipe(
          catchError(error => (error?.status === 404 || error?.statusCode === 404) ? of(null) : throwError(() => error))
      );
  }

  /** NestoApp#219 (Nesto#521): de qué vendedores puede ver la lista el usuario. null si falla o la API es vieja: sin selector. */
  public cargarVendedoresVisibles(): Observable<VendedorVisible[] | null> {
      const params = new HttpParams().set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      return this.http.get<VendedorVisible[]>(Configuracion.API_URL + '/Vendedores/VisiblesEnSugerencias', { params }).pipe(
          catchError(() => of(null))
      );
  }

  /** NestoApp#226: resumen de la campaña de cheques por vendedor. null = 404 (sin campaña en curso): no se enseña. */
  public cargarResumenChequesRegalo(): Observable<ResumenChequesRegalo | null> {
      const params = new HttpParams().set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      return this.http.get<ResumenChequesRegalo>(Configuracion.API_URL + '/ChequesRegalo/Resumen', { params }).pipe(
          catchError(error => (error?.status === 404 || error?.statusCode === 404) ? of(null) : throwError(() => error))
      );
  }

  /** NestoApp#226: cheques sin usar del vendedor, para la barrida telefónica. */
  public cargarChequesRegaloPendientes(vendedor: string): Observable<ChequeRegaloPendiente[]> {
      const params = new HttpParams().set('empresa', Configuracion.EMPRESA_POR_DEFECTO).set('vendedor', vendedor);
      return this.http.get<ChequeRegaloPendiente[]>(Configuracion.API_URL + '/ChequesRegalo/Pendientes', { params }).pipe(
          map(cheques => cheques || [])
      );
  }

  /** NestoApp#226: el PDF de la factura que generó el cheque (en la serie GB la empresa es la 3: la manda la API). */
  public descargarFactura(empresa: string, numeroFactura: string): Observable<Blob> {
      const params = new HttpParams().set('empresa', (empresa || '').trim()).set('numeroFactura', (numeroFactura || '').trim());
      return this.http.get(Configuracion.API_URL + '/Facturas', { params, responseType: 'blob' });
  }

    public cargarResumenRapports(cliente: string, contacto: string): Observable<string> {
      // Construimos la URL con los parámetros
      const urlConsulta = `${this._baseUrl}/Resumen?empresa=${Configuracion.EMPRESA_POR_DEFECTO}&cliente=${cliente}&contacto=${contacto}`;

      // Realizamos la petición GET
      return this.http.get<any>(urlConsulta).pipe(
        // Transformamos la respuesta en el resumen
        map(response => {
          if (response && response.Resumen) {
            return response.Resumen;
          } else {
            throw new Error('La respuesta no contiene el resumen esperado.');
          }
        })
      );
    }
}