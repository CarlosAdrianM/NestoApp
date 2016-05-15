import {Injectable} from 'angular2/core';
import {Http, Response, URLSearchParams} from 'angular2/http';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../configuracion/configuracion';

@Injectable()
export class SelectorPlantillaVentaService {
    private http: Http;
    constructor(http: Http) {
        this.http = http;
    }

    public getProductos(cliente: string): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);

        return this.http.get(_baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public cargarStockProducto(producto: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/CargarStocks';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('almacen', Configuracion.ALMACEN_POR_DEFECTO);
        params.set('productoStock', producto.producto);

        return this.http.get(_baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public buscarProductos(filtro: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/BuscarProducto';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('filtroProducto', filtro);

        return this.http.get(_baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public actualizarPrecioProducto(producto: any, cliente: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/CargarPrecio';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('cliente', cliente);
        params.set('contacto', '0'); // porque aún no sabemos la dirección de entrega
        params.set('productoPrecio', producto.producto);
        params.set('cantidad', producto.cantidad);
        params.set('aplicarDescuento', producto.aplicarDescuentoFicha);
        // params.set('aplicarDescuento', producto.cantidadOferta === 0  ? producto.aplicarDescuento : false);

        return this.http.get(_baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    public comprobarCondicionesPrecio(linea: any): Observable<any> {
        let _baseUrl: string = Configuracion.API_URL + '/PlantillaVentas/ComprobarCondiciones';
        let params: URLSearchParams = new URLSearchParams();
        params.set('empresa', Configuracion.EMPRESA_POR_DEFECTO);
        params.set('producto', linea.producto);
        params.set('aplicarDescuento', linea.aplicarDescuento); 
        params.set('precio', linea.precio);
        params.set('descuento', linea.descuento);
        params.set('cantidad', linea.cantidad);
        params.set('cantidadOferta', linea.cantidadOferta);

        return this.http.get(_baseUrl, { search: params })
            .map(res => <any[]>res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

}
