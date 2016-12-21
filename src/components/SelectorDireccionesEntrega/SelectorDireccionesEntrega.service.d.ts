import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class SelectorDireccionesEntregaService {
    private http;
    constructor(http: Http);
    direccionesEntrega(cliente: any): Observable<any>;
    private handleError(error);
}
