import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
export declare class SelectorProductosService {
    private http;
    constructor(http: Http);
    private _consultaUrl;
    getProductos(filtro: string): Observable<any>;
    private handleError;
}
