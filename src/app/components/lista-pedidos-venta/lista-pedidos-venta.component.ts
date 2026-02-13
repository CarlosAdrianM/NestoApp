import { Component, OnInit, ViewChild } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { ListaPedidosVentaService } from './lista-pedidos-venta.service';

@Component({
  selector: 'app-lista-pedidos-venta',
  templateUrl: './lista-pedidos-venta.component.html',
  styleUrls: ['./lista-pedidos-venta.component.scss'],
})
export class ListaPedidosVentaComponent extends SelectorBase implements OnInit {
    // private listaPedidos: any[];
    private nav: NavController;
    private servicio: ListaPedidosVentaService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private _estaFiltradoPendientes: boolean;
    get estaFiltradoPendientes(): boolean {
        return this._estaFiltradoPendientes;
    }
    set estaFiltradoPendientes(value: boolean) {
        if (this._estaFiltradoPendientes != value) {
            this._estaFiltradoPendientes = value;
            if (value && this.estaFiltradoPresupuestos) {
                this.estaFiltradoPresupuestos = false;
            }
            if (value) {
                this.datosFiltrados = this.datosFiltrados.filter((e)=> e.tienePendientes);
            } else {
                this.datosFiltrados = this.datosIniciales();
                this._estaFiltradoPicking = false;
            }    
        }        
    }
    private _estaFiltradoPicking: boolean;
    get estaFiltradoPicking(): boolean {
        return this._estaFiltradoPicking;
    }
    set estaFiltradoPicking(value: boolean) {
        if (this._estaFiltradoPicking != value) {
            this._estaFiltradoPicking = value;
            if (value && this.estaFiltradoPresupuestos) {
                this.estaFiltradoPresupuestos = false;
            }
            if (value) {
                this.datosFiltrados = this.datosFiltrados.filter((e)=> e.tienePicking);
            } else {
                this.datosFiltrados = this.datosIniciales();
                this._estaFiltradoPendientes = false;
            }    
        }   
    }
    private _estaFiltradoPresupuestos: boolean;
    get estaFiltradoPresupuestos(): boolean {
        return this._estaFiltradoPresupuestos;
    }
    set estaFiltradoPresupuestos(value: boolean) {
        if (value != this._estaFiltradoPresupuestos) {
            if (value && this.estaFiltradoPendientes) {
                this.estaFiltradoPendientes = false;
            }
            if (value && this.estaFiltradoPicking) {
                this.estaFiltradoPicking = false;
            }
            this._estaFiltradoPresupuestos = value;
            this.cargarDatos();    
        }
    }

    constructor(
        servicio: ListaPedidosVentaService, 
        nav: NavController, 
        alertCtrl: AlertController, 
        loadingCtrl: LoadingController, 
        private fileOpener: FileOpener,
        private firebaseAnalytics: FirebaseAnalytics
        ) {
        super();
        this.servicio = servicio;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.cargarDatos();
    }

    @ViewChild('filtro') selectorPedidos: any;

    ngOnInit(): void {
      setTimeout(()=>{
        this.selectorPedidos.setFocus();
      },500)
    }


    public abrirPedido(pedido: any): void {
        this.nav.navigateForward('pedido-venta',{ queryParams: { empresa: pedido.empresa, numero: pedido.numero }});
    }

    public abrirPedidoNumero(numeroPedido: any): void {
        this.nav.navigateForward('pedido-venta', {queryParams:{ empresa: "1", numero: +numeroPedido }});
    }

    public async cargarDatos(): Promise<void> {
        let loading: any = await this.loadingCtrl.create({
            message: 'Cargando Pedidos...',
        });

        await loading.present();

        this.servicio.cargarLista(this.estaFiltradoPresupuestos).subscribe(
            async data => {
                if (data.length === 0) {
                    let alert = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'No hay ningún pedido pendiente de servir',
                        buttons: ['Ok'],
                    });
                    await alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            async error => {
                await loading.dismiss();
                this.errorMessage = <any>error;
            },
            async () => {
                await loading.dismiss();
            }
        );
    }

    public async mostrarFiltros() {
        let alert = await this.alertCtrl.create({
          header: 'Seleccione los filtros',
          inputs: [{
            type: 'checkbox',
            label: 'Presupuestos',
            value: 'presupuestos',
            checked: this.estaFiltradoPresupuestos,
            handler: data => { 
                this.firebaseAnalytics.logEvent("lista_pedidos_filtro", {filtro: "presupuestos", valor: data.checked});
                this.estaFiltradoPresupuestos = data.checked
            }
          },
          {
            type: 'checkbox',
            label: 'Pendientes',
            value: 'pendientes',
            checked: this.estaFiltradoPendientes,
            handler: data => { 
                this.firebaseAnalytics.logEvent("lista_pedidos_filtro", {filtro: "pendientes", valor: data.checked});
                this.estaFiltradoPendientes = data.checked
            }
          },
          {
            type: 'checkbox',
            label: 'Picking',
            value: 'picking',
            checked: this.estaFiltradoPicking,
            handler: data => { 
                this.firebaseAnalytics.logEvent("lista_pedidos_filtro", {filtro: "picking", valor: data.checked});
                this.estaFiltradoPicking = data.checked
            }
          }],
          buttons: [
            {text:'OK'}
          ]
        });

        await alert.present();
    }

    public async descargarPedido(event: Event, pedido: any): Promise<void> {
        event.stopPropagation();
        let loading: any = await this.loadingCtrl.create({
            message: 'Generando PDF pedido...',
        });

        await loading.present();

        this.servicio.descargarPedido(pedido.empresa, pedido.numero).then(
            async (rutaArchivo: string) => {
                this.firebaseAnalytics.logEvent("descargar_pedido", {empresa: pedido.empresa, pedido: pedido.numero});
                await loading.dismiss();
                this.fileOpener.open(rutaArchivo, 'application/pdf');
            },
            async error => {
                await loading.dismiss();
                this.errorMessage = <any>error;
            }
        );
    }
}
