import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class PlantillaVentaService {
    private http;
    constructor(http: Http);
    private _baseUrl;
    crearPedido(pedido: any): Observable<any>;
    private handleError(error);
}
