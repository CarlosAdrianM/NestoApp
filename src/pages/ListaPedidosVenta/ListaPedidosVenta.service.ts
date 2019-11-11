import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';


@Injectable()
export class ListaPedidosVentaService {
    
    private usuario: any;

    constructor(
        private http: HttpClient, 
        usuario: Usuario, 
        private transfer: FileTransfer, 
        private file: File
    ) {
        this.usuario = usuario;
    }

    private _baseUrl: string = Configuracion.API_URL + '/PedidosVenta';
    
    public cargarLista(mostrarPresupuestos: boolean): Observable<any> {
        let params: HttpParams = new HttpParams();
        if (this.usuario.vendedor) {
            params = params.append('vendedor', this.usuario.vendedor);
        } else {
            params = params.append('vendedor', '');
        }
        if (mostrarPresupuestos) {
            params = params.append('estado', "-3");
        }

        return this.http.get(this._baseUrl, { params })
            .catch(this.handleError);
    }

    public descargarPedido(empresa: string, pedido: number): Promise<any> {
        const filetransfer: FileTransferObject = this.transfer.create(); 
        const url = Configuracion.API_URL + "/Facturas?empresa="+empresa.trim()+"&numeroFactura="+pedido.toString().trim(); 
        return filetransfer.download(url, this.file.externalDataDirectory + pedido.toString().trim() + '.pdf')
            .catch(this.handleError);
     }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    }


}