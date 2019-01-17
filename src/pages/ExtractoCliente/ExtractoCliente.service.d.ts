import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class ExtractoClienteService {
    private http;
    constructor(http: Http);
    private _baseUrl;
    cargarDeuda(cliente: any): Observable<any>;
    private handleError;
}
