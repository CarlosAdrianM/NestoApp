import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Usuario } from "src/app/models/Usuario";
import { Configuracion } from "../../configuracion/configuracion/configuracion.component";

@Injectable({
    providedIn: 'root'
  })
  export class ProfileService {
    constructor(private http: HttpClient, private usuario: Usuario) {    }

    private _seEstaVendiendoUrl: string = Configuracion.API_URL + '/SeEstaVendiendo';

    public getSeEstaVendiendo(): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('usuario', Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre);

        return this.http.get(this._seEstaVendiendoUrl, { params });
    }
  }