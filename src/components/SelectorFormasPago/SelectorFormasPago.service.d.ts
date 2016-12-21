import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Usuario } from '../../models/Usuario';
export declare class SelectorFormasPagoService {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    private _baseUrl;
    getFormasPago(cliente: any): Observable<any[]>;
    private handleError(error);
}
