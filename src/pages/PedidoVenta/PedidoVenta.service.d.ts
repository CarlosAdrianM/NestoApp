import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { PedidoVenta } from '../PedidoVenta/PedidoVenta';
export declare class PedidoVentaService {
    private http;
    constructor(http: Http);
    private _baseUrl;
    cargarPedido(empresa: string, numero: number): Observable<PedidoVenta>;
    modificarPedido(pedido: any): Observable<any>;
    private handleError(error);
}
