'use strict';
import {Injectable, ViewChild} from '@angular/core';
//import { Nav } from 'ionic-angular';
//import { ProfilePage } from '../pages/profile/profile';


@Injectable()
export class Usuario {

    //@ViewChild(Nav) nav;

    constructor() {
    }

    public nombre: string;
    public almacen: string = 'ALG';
    public delegacion: string = 'ALG';
    public formaVenta: string = 'DIR';
    public vendedor: string;
    public ultimoTipoRapport: string = 'V';
}
