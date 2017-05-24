import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Usuario } from '../../models/Usuario';
export declare class RapportService {
    private usuario;
    private http;
    constructor(http: Http, usuario: Usuario);
    private _baseUrl;
    crearRapport(rapport: any): Observable<any>;
    private _clientesUrl;
    getCliente(cliente: string, contacto: string): Observable<any>;
    private handleError(error);
}
