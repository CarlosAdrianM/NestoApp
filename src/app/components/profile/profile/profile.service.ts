import { HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
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
  
        return this.http.get(this._seEstaVendiendoUrl, { params })
        .pipe(
          catchError(this.handleError)
        )
    }
  
    private handleError(error: HttpErrorResponse): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return throwError(error.error || 'Server error');
    }
  }