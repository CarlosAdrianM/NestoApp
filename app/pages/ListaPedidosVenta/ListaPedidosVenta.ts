// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes

// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
import {Component} from '@angular/core';
import { NavController, Alert, Loading} from 'ionic-angular';
import { Parametros } from '../../services/Parametros.service';
import {ListaPedidosVentaService} from './ListaPedidosVenta.service';
import {PedidoVenta} from '../PedidoVenta/PedidoVenta';
import {SelectorBase} from '../../componentes/SelectorBase/SelectorBase';

@Component({
    templateUrl: 'build/pages/ListaPedidosVenta/ListaPedidosVenta.html',
    providers: [ListaPedidosVentaService, Parametros],
})
export class ListaPedidosVenta extends SelectorBase {
    // private listaPedidos: any[];
    private nav: NavController;
    private servicio: ListaPedidosVentaService;

    constructor(servicio: ListaPedidosVentaService, nav: NavController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.cargarDatos(''); // El parámetro no se usa para nada
    }

    private abrirPedido(pedido: any): void {
        this.nav.push(PedidoVenta, { empresa: pedido.empresa, numero: pedido.numero });
    }

    public cargarDatos(nada: string): void {
        let loading: any = Loading.create({
            content: 'Cargando Pedidos...',
        });

        this.nav.present(loading);

        this.servicio.cargarLista().subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'No hay ningún pedido pendiente de servir',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                loading.dismiss();
            }
        );
    }

    private cadenaFecha(cadena: string): Date {
        return new Date(cadena);
    }

}
