import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { CCC, CCC_SIN_CCC } from 'src/app/models/ccc.model';

@Injectable({
  providedIn: 'root'
})
export class SelectorCCCService {
  constructor(private http: HttpClient) { }

  private _baseUrl: string = Configuracion.API_URL + '/Clientes/CCCs';

  public getCCCs(empresa: string, cliente: string, contacto: string): Observable<CCC[]> {
    let params: HttpParams = new HttpParams();
    params = params.append('empresa', empresa);
    params = params.append('cliente', cliente);
    params = params.append('contacto', contacto);

    return this.http.get<CCC[]>(this._baseUrl, { params }).pipe(
      map(cccs => [CCC_SIN_CCC, ...cccs])
    );
  }
}
