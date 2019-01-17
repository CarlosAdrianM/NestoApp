import { Usuario } from '../models/Usuario';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class Parametros {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    leer(clave: string): Observable<any>;
    private handleError;
}
