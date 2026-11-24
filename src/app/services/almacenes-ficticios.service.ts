import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { AlmacenFicticio, ExistenciasAlmacenFicticio } from '../models/almacen-ficticio.model';

/** NestoApp#292 / NestoAPI#894: los almacenes ficticios que el usuario puede ver y lo que hay en cada uno. Solo consulta. */
@Injectable({
  providedIn: 'root'
})
export class AlmacenesFicticiosService {
  private readonly url = `${Configuracion.API_URL}/AlmacenesFicticios`;

  constructor(private http: HttpClient) { }

  /** El suyo sale el primero. Lista vacía = no tiene almacén asignado. */
  public leerAlmacenes(): Observable<AlmacenFicticio[]> {
    return this.http.get<AlmacenFicticio[]>(this.url).pipe(map(a => a || []));
  }

  /** Solo los productos con saldo distinto de 0. 403 si no es suyo ni de su equipo; 404 si no es un ficticio activo. */
  public leerExistencias(codigo: string): Observable<ExistenciasAlmacenFicticio> {
    const almacen = encodeURIComponent((codigo || '').toString().trim());
    return this.http.get<ExistenciasAlmacenFicticio>(`${this.url}/${almacen}/Existencias`).pipe(
      map(e => ({ ...(e || { Almacen: codigo }), Productos: e?.Productos || [] } as ExistenciasAlmacenFicticio))
    );
  }
}
