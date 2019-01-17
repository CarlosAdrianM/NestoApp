import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
export declare class ComisionesService {
    private http;
    private _baseUrl;
    constructor(http: Http);
    cargarResumen(vendedor: string, mes: number, anno: number, incluirAlbaranes: boolean): Observable<any>;
    cargarPrueba(): any;
    private handleError;
}
