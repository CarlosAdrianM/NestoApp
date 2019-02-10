import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';
import 'rxjs/add/observable/of';

@Injectable()
export class SelectorAlmacenesService {
    private http: Http;
    private usuario: Usuario;

    constructor(http: Http, usuario: Usuario) {
        this.http = http;
        this.usuario = usuario;
    }

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
        return Observable.of(listaAlmacenes);
    }
    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}
