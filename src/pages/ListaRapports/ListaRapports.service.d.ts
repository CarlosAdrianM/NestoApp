import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Usuario } from '../../models/Usuario';
export declare class ListaRapportsService {
    private http;
    private usuario;
    constructor(http: Http, usuario: Usuario);
    private _baseUrl;
    cargarListaFecha(fecha: string): Observable<any>;
    cargarListaCliente(cliente: string, contacto: string): Observable<any>;
    private handleError;
}
