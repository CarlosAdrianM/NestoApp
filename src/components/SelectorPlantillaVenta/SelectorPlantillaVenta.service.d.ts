import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
export declare class SelectorPlantillaVentaService {
    private http;
    constructor(http: Http);
    getProductos(cliente: string): Observable<any>;
    cargarStockProducto(producto: any): Observable<any>;
    buscarProductos(filtro: any): Observable<any>;
    actualizarPrecioProducto(producto: any, cliente: any): Observable<any>;
    comprobarCondicionesPrecio(linea: any): Observable<any>;
    private handleError(error);
}
