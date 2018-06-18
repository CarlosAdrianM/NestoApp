import { Injectable } from "@angular/core";
import { Http, Response, URLSearchParams } from "@angular/http";
import { Configuracion } from "../configuracion/configuracion";
import { Observable } from "rxjs/Observable";

@Injectable()
export class SelectorProductosService {
  constructor(private http: Http) { };

  private _consultaUrl: string = Configuracion.API_URL + '/Productos';

  public getProductos(filtro: string): Observable<any> {
    let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
    let params: URLSearchParams = new URLSearchParams();
    params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    params.set('filtroProducto', filtro);

    return this.http.get(_baseUrl, { search: params })
      .map(res => <any[]>res.json())
      .catch(this.handleError);


    //let params: URLSearchParams = new URLSearchParams();
    //params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
    //params.set('filtro', filtro);
    //params.set('filtroNombre', filtro[0]);
    //params.set('filtroFamilia', filtro[1]);
    //params.set('filtroSubgrupo', filtro[2]);
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the error to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json().error || 'Server error');
  }
}
