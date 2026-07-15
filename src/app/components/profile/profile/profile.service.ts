import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Configuracion } from "../../configuracion/configuracion/configuracion.component";

@Injectable({
    providedIn: 'root'
  })
  export class ProfileService {
    constructor(private http: HttpClient) {    }

    private _seEstaVendiendoUrl: string = Configuracion.API_URL + '/SeEstaVendiendo';

    public getSeEstaVendiendo(): Observable<any> {
        // El usuario lo lee NestoAPI del JWT (User.Identity.Name). El interceptor ya añade el
        // Authorization Bearer. Ver NestoAPI: migrar SeEstaVendiendoController a leer el usuario
        // del token (hoy aún exige ?usuario= y por eso la lista venía vacía).
        return this.http.get(this._seEstaVendiendoUrl);
    }
  }
