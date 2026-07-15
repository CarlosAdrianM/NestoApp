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
    public vendedor: string = "Sin Vendedor";
    public ultimoTipoRapport: string = 'V';
    public permitirVerTodosLosPedidos: boolean = false;
    public permitirVerClientesTodosLosVendedores: boolean = false;
    public permitirVerTodosLosVendedores: boolean = false;
    public permitirCrearPedidoConErroresValidacion: boolean = false;
    public motorPagos: string = 'Paygold';
    public almacenesPlantillaVenta: string = 'ALG,ALC,REI';

    get verStockTresAlmacenes(): boolean {
        return this.almacenesPlantillaVenta.split(',').length > 1;
    }
}
