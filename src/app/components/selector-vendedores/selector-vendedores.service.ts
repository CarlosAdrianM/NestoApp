import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Usuario } from 'src/app/models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class SelectorVendedoresService {

  constructor(private http: HttpClient,
              private usuario: Usuario) {    }

    private _baseUrl: string = Configuracion.API_URL + '/Vendedores'

    public getVendedores(): Observable<any[]> {
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        if (!this.usuario.permitirVerTodosLosVendedores){
          params = params.append('vendedor', this.usuario.vendedor);
        }
        return this.http.get<any[]>(this._baseUrl, { params: params });
    }
}
