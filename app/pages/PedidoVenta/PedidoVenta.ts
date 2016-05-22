import {Page, NavController, NavParams, Alert, Loading} from 'ionic-angular';
import { Parametros } from '../../services/Parametros.service';
import {PedidoVentaService} from './PedidoVenta.service';
import { SelectorFormasPago } from '../../componentes/SelectorFormasPago/SelectorFormasPago';
import { SelectorPlazosPago } from '../../componentes/SelectorPlazosPago/SelectorPlazosPago';
import {SelectorDireccionesEntrega} from '../../componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega';

@Page({
    templateUrl: 'build/pages/PedidoVenta/PedidoVenta.html',
    providers: [PedidoVentaService, Parametros],
    directives: [SelectorFormasPago, SelectorPlazosPago, SelectorDireccionesEntrega], 
})
export class PedidoVenta {

    private iva: string;
    private nav: NavController;
    private pedido: any;
    private segmentoPedido: string = 'cabecera';
    private servicio: PedidoVentaService;
    
    constructor(servicio: PedidoVentaService, nav: NavController, navParams: NavParams) {
        this.nav = nav;
        this.servicio = servicio;
        this.cargarPedido(navParams.get('empresa'), navParams.get('numero'));
    }

    public cargarPedido(empresa: string, numero: number): void {
        let loading: any = Loading.create({
            content: 'Cargando Pedido...',
        });

        this.nav.present(loading);

        this.servicio.cargarPedido(empresa, numero).subscribe(
            data => {
                this.pedido = data;
                //this.pedido.fechaMostrar = new Date(this.pedido.fecha);
                //this.pedido.primerVencimientoMostrar = new Date(this.pedido.primerVencimiento);
                this.iva = this.pedido.iva;
                this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
            },
            error => {
                let alert: Alert = Alert.create({
                    title: 'Error',
                    subTitle: 'No se ha podido cargar el pedido',
                    buttons: ['Ok'],
                });
                this.nav.present(alert);
                loading.dismiss();
            },
            () => {
                loading.dismiss();
            }
        );
    }
    
    public seleccionarFormaPago(evento: any): void {
        this.pedido.formaPago = evento;
    }

    private cambiarIVA(): void {
        this.pedido.iva = this.pedido.iva ? undefined : this.iva;
    }

}