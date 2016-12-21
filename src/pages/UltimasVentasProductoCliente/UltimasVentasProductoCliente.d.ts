import { NavController, NavParams } from 'ionic-angular';
import { UltimasVentasProductoClienteService } from './UltimasVentasProductoCliente.service';
export declare class UltimasVentasProductoCliente {
    private nav;
    private servicio;
    private navParams;
    constructor(nav: NavController, servicio: UltimasVentasProductoClienteService, navParams: NavParams);
    movimientos: any[];
    private errorMessage;
    private cargarUltimasVentas(cliente, producto);
}
