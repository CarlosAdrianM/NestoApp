import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
export declare class RapportService {
    private http;
    constructor(http: Http);
    private _baseUrl;
    crearRapport(rapport: any): Observable<any>;
    private _clientesUrl;
    getCliente(cliente: string, contacto: string): Observable<any>;
    private handleError;
}
