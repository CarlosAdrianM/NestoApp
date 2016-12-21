import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class UltimasVentasProductoClienteService {
    private http;
    constructor(http: Http);
    cargarUltimasVentas(producto: string, cliente: string): Observable<any>;
    private handleError(error);
}
