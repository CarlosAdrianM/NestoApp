import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {Configuracion} from '../../components/configuracion/configuracion';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';

@Injectable()
export class ExtractoClienteService {

    constructor(private http: HttpClient, 
        private transfer: FileTransfer, 
        private file: File,
        private fileOpener: FileOpener) {
        this.http = http;
    }

    private _baseUrl: string = Configuracion.API_URL + '/ExtractosCliente';

    public cargarDeuda(cliente: any): Observable<any> {
        let params: HttpParams = new HttpParams();
        params = params.append('cliente', cliente.cliente);

        return this.http.get(this._baseUrl, { params })
            .catch(this.handleError);
    }

    public descargarFactura(empresa: string, numeroFactura: string) {
        /*
        let params: HttpParams = new HttpParams();
        params = params.append('empresa', empresa);
        params = params.append('numeroFactura', numeroFactura);

        return this.http.get(Configuracion.API_URL + "/Facturas", { params })
            .catch(this.handleError);
        */
       const filetransfer: FileTransferObject = this.transfer.create(); 
       const url = Configuracion.API_URL + "/Facturas?empresa="+empresa.trim()+"&numeroFactura="+numeroFactura.trim(); 
       filetransfer.download(url, this.file.externalDataDirectory + numeroFactura.trim() + '.pdf').then((entry) => {
           this.fileOpener.open(entry.toURL(), 'application/pdf')
            .then(() => console.log('File is opened'))
            .catch(e => console.log('Error opening file', e));
       }, (error) => {
           alert(error);
       });
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json() || 'Server error');
    }

}
