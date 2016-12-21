import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Usuario } from '../../models/Usuario';
export declare class ListaPedidosVentaService {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    private _baseUrl;
    cargarLista(): Observable<any>;
    private handleError(error);
}
