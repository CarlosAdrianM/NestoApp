import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
export declare class LineaVentaService {
    private http;
    constructor(http: Http);
    private _baseUrl;
    getProducto(producto: any): Observable<any>;
    private handleError;
}
