import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { AvisosPromesaRiesgo, PedidoPromesaRiesgo } from '../models/pedido-promesa-riesgo.model';

/** NestoApp#248 / NestoAPI#693: pedidos con la fecha de entrega prometida en riesgo y los avisos que recibe el usuario. */
@Injectable({
  providedIn: 'root'
})
export class PedidosEnRiesgoService {
  private readonly url = `${Configuracion.API_URL}/PedidosVenta/PromesaEnRiesgo`;

  constructor(private http: HttpClient) { }

  /**
   * Sin vendedor: la API da los del vendedor del usuario y los de su equipo (Dirección, todos). Con `resueltos`, detrás
   * van también los resueltos de los últimos 30 días.
   */
  public leer(resueltos: boolean = false, empresa: string = Configuracion.EMPRESA_POR_DEFECTO): Observable<PedidoPromesaRiesgo[]> {
    let params = new HttpParams().set('empresa', (empresa || Configuracion.EMPRESA_POR_DEFECTO).toString().trim());
    if (resueltos) {
      params = params.set('resueltos', 'true');
    }
    return this.http.get<PedidoPromesaRiesgo[]>(this.url, { params }).pipe(map(p => p || []));
  }

  public leerAvisos(): Observable<AvisosPromesaRiesgo> {
    return this.http.get<AvisosPromesaRiesgo>(`${this.url}/Avisos`);
  }

  public guardarAvisos(valor: string): Observable<AvisosPromesaRiesgo> {
    return this.http.put<AvisosPromesaRiesgo>(`${this.url}/Avisos`, { Valor: valor });
  }
}
