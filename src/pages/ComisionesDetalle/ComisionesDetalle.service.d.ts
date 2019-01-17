import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
export declare class ComisionesDetalleService {
    private http;
    private _baseUrl;
    constructor(http: Http);
    cargarDetalle(vendedor: string, anno: number, mes: number, incluirAlbaranes: boolean, etiqueta: string): Observable<any>;
    private handleError;
}
