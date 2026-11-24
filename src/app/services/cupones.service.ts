import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { CuponCliente } from '../models/cupon.model';

/**
 * NestoApp#291 / NestoAPI#885: adelantar por excepción un cupón de evento (pasa a valer desde hoy en vez de desde el día
 * del evento). Solo quien tiene permiso (Dirección, o el jefe de equipo en los clientes de sus vendedores): 403 si no;
 * 409 si el cupón ya vale, está usado, anulado, caducado o no es de evento. Devuelve el cupón como ha quedado.
 */
@Injectable({
  providedIn: 'root'
})
export class CuponesService {
  constructor(private http: HttpClient) { }

  public adelantar(codigo: string, motivo: string): Observable<CuponCliente> {
    const url = `${Configuracion.API_URL}/Cupones/${encodeURIComponent((codigo || '').toString().trim())}/Adelantar`;
    return this.http.post<CuponCliente>(url, { Motivo: (motivo || '').trim() });
  }
}
