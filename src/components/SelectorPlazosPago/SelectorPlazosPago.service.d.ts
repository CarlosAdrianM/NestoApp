import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Usuario } from '../../models/Usuario';
export declare class SelectorPlazosPagoService {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    private _baseUrl;
    getPlazosPago(cliente: any): Observable<any[]>;
    private handleError;
}
