import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class SelectorAlmacenesService {
  constructor(private usuario: Usuario) {}

  private _baseUrl: string = Configuracion.API_URL + '/Almacenes';

  public getAlmacenes(cliente: any): Observable<any[]> {
      var listaAlmacenes = [
          {
              almacen : "ALG",
              descripcion : "Algete"
          },
          {
              almacen : "REI",
              descripcion : "Reina"
          }
      ];
      return of(listaAlmacenes);
  }
}
