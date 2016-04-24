import {Page, NavController, NavParams} from 'ionic-angular';
import { UltimasVentasProductoClienteService } from './UltimasVentasProductoCliente.service';

@Page({
    templateUrl: 'build/pages/UltimasVentasProductoCliente/UltimasVentasProductoCliente.html',
    providers: [UltimasVentasProductoClienteService],
})
export class UltimasVentasProductoCliente {
    private nav: NavController;
    private servicio: UltimasVentasProductoClienteService;
    private navParams: NavParams;

    constructor(nav: NavController, servicio: UltimasVentasProductoClienteService, navParams: NavParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.servicio = servicio;
        this.cargarUltimasVentas(this.navParams.data.producto, this.navParams.data.cliente);
    }

    private movimientos: any[];
    private errorMessage: string;

    private cargarUltimasVentas(cliente: string, producto: string): void {
        this.servicio.cargarUltimasVentas(cliente, producto).subscribe(
            data => {
                this.movimientos = data;
                for (let mov of this.movimientos) {
                    mov.fechaMostrar = new Date(mov.fecha);
                }
            },
            error => this.errorMessage = <any>error
        );
    }
}
