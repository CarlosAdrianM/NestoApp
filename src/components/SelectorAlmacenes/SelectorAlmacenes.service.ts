import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Configuracion} from '../../components/configuracion/configuracion';
import {Usuario} from '../../models/Usuario';
import 'rxjs/add/observable/of';

@Injectable()
export class SelectorAlmacenesService {
    
    constructor(private usuario: Usuario) {}

    private _baseUrl: string = Configuracion.API_URL + '/Almacenes';

    public getAlmacenes(cliente: any): Observable<any[]> {
        var listaAlmacenes = [
            {
                almacen : "ALG",
                descripcion : "Algete"
            },
            {
                almacen : "REI",
                descripcion : "Reina"
            }
        ];
        return Observable.of(listaAlmacenes);
    }
}
