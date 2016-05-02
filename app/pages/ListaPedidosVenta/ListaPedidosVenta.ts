// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes

// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
import {Page, NavController, Alert, Loading} from 'ionic-angular';
import { Parametros } from '../../services/Parametros.service';
import {ListaPedidosVentaService} from './ListaPedidosVenta.service';
import {PedidoVenta} from '../PedidoVenta/PedidoVenta';

@Page({
    templateUrl: 'build/pages/ListaPedidosVenta/ListaPedidosVenta.html',
    providers: [ListaPedidosVentaService, Parametros],
})
export class ListaPedidosVenta {
    private nav: NavController;
    private listaPedidos: any[];
    private servicio: ListaPedidosVentaService;

    constructor(servicio: ListaPedidosVentaService, nav: NavController) {
        this.servicio = servicio;
        this.nav = nav;
        this.cargarLista();
    }

    private abrirPedido(pedido: any): void {
        this.nav.push(PedidoVenta, { empresa: pedido.empresa, numero: pedido.numero });
    }

    private cargarLista(): void {
        this.listaPedidos = this.servicio.cargarLista();
    }
}