import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Usuario } from '../../models/Usuario';
export declare class SelectorClientesService {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    private _clientesUrl;
    getClientes(filtro: string): Observable<any>;
    private handleError(error);
}
