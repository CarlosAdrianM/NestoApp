// Cargar un stub porque no hay servicio creado en la API
// últimos 20 pedidos del vendedor
// botón de cargar 20 siguienes

// Al abrir un pedido hacemos un nav.push al pedido en cuestión.
import {Component} from '@angular/core';
import { NavController, AlertController, LoadingController} from 'ionic-angular';
// import { Parametros } from '../../services/Parametros.service';
import {ListaPedidosVentaService} from './ListaPedidosVenta.service';
import {PedidoVentaComponent} from '../PedidoVenta/PedidoVenta.component';
import {SelectorBase} from '../../components/SelectorBase/SelectorBase';

@Component({
    templateUrl: 'ListaPedidosVenta.html',
})
export class ListaPedidosVenta extends SelectorBase {
    // private listaPedidos: any[];
    private nav: NavController;
    private servicio: ListaPedidosVentaService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;

    constructor(servicio: ListaPedidosVentaService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarDatos(''); // El parámetro no se usa para nada
    }

    public abrirPedido(pedido: any): void {
        this.nav.push(PedidoVentaComponent, { empresa: pedido.empresa, numero: pedido.numero });
    }

    public abrirPedidoNumero(numeroPedido: number): void {
        this.nav.push(PedidoVentaComponent, { empresa: "1", numero: numeroPedido });
    }

    public cargarDatos(nada: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Pedidos...',
        });

        loading.present();

        this.servicio.cargarLista().subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No hay ningún pedido pendiente de servir',
                        buttons: ['Ok'],
                    });
                    alert.present();
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

/*
    private cadenaFecha(cadena: string): Date {
        return new Date(cadena);
    }
*/

}
