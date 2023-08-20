import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorFormasPagoService } from './selector-formas-pago.service';

@Component({
  selector: 'selector-formas-pago',
  templateUrl: './selector-formas-pago.component.html',
  styleUrls: ['./selector-formas-pago.component.scss'],
})
export class SelectorFormasPagoComponent extends SelectorBase implements OnInit {

    @Input() public cliente: any;
    private _seleccionado: any;
    @Input() 
    get seleccionado(){
        return this._seleccionado;
    }
    set seleccionado(value: any) {
        if (this.datosFiltrados){
            const seleccionadoEnFiltrados = this.datosFiltrados.some(forma => forma.formaPago === value);
            // Si no está en datosFiltrados, establece seleccionado en null
            if (!seleccionadoEnFiltrados) {
                this._seleccionado = null;
                //this.seleccionarDato(this.seleccionado);
            } else {
                this._seleccionado = value;
            }    
        } else {
            this._seleccionado = value;
        }
    }
    private _totalPedido: number;
    @Input()
    public get totalPedido(): number {
        return this._totalPedido;
    }

    public set totalPedido(value: number) {
        if (value !== this._totalPedido) {
            this._totalPedido = value;
            this.cargarDatos();
        }
    }
    private _tipoTiva: string;
    @Input() 
    public get tipoIva(): string {
        return this._tipoTiva;
    };
    public set tipoIva(value: string) {
        if (value !== this._tipoTiva) {
            this._tipoTiva = value;
            this.cargarDatos();
        }
    }
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorFormasPagoService;

    constructor(servicio: SelectorFormasPagoService, 
        alertCtrl: AlertController, 
        loadingCtrl: LoadingController, 
        ) {
        super();
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        this.servicio.getFormasPago(this.cliente, this.totalPedido, this.tipoIva).subscribe(
            async data => {
                if (data.length === 0) {
                    let alert: any = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'Error al cargar las formas de pago',
                        buttons: ['Ok'],
                    });
                    await alert.present();
                } else {
                    this.inicializarDatos(data);
                    const seleccionadoEnFiltrados = this.datosFiltrados.some(forma => forma.formaPago === this.seleccionado);
                    // Si no está en datosFiltrados, establece seleccionado en null
                    if (!seleccionadoEnFiltrados) {
                        this.seleccionado = null;
                        this.seleccionarDato(this.seleccionado);
                    }
                }
            },
            error => {
                // loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                // loading.dismiss();
            }
        );
    }
}
