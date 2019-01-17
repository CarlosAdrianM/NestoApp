import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
export declare class ProductoService {
    private http;
    private _baseUrl;
    constructor(http: Http);
    cargar(empresa: string, id: string, fichaCompleta: boolean): Observable<any>;
    private handleError;
}
