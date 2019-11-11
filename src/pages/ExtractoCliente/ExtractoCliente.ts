import {Component, ViewChild} from '@angular/core';
import {ExtractoClienteService} from './ExtractoCliente.service';
import { AlertController, LoadingController } from 'ionic-angular';
import { FileOpener } from '@ionic-native/file-opener';

@Component({
    templateUrl: 'ExtractoCliente.html',
})
export class ExtractoCliente {
    private servicio: ExtractoClienteService;
    constructor(servicio: ExtractoClienteService,
        private alertCtrl: AlertController, 
        private loadingCtrl: LoadingController, 
        private fileOpener: FileOpener) {
        this.servicio = servicio;
    };

    public mostrarClientes: boolean = true;
    public movimientosDeuda: any[];
    private errorMessage: string;
    public resumenDeuda: any = {};
    public tipoMovimientos: string = "deuda";
    public clienteSeleccionado: any;
    private hoy: Date;

    @ViewChild('selector') selectorClientes: any;

    ngAfterViewInit() {
        setTimeout(()=>{
            this.selectorClientes.setFocus();
        },500)
    }

    public onSegmentChange(): void {
        if (!this.clienteSeleccionado || this.clienteSeleccionado.cliente == "") {
            return;
        }
        if (this.tipoMovimientos == "deuda") {
            this.cargarDeuda(this.clienteSeleccionado);
        }
        if (this.tipoMovimientos == "facturas") {
            this.cargarFacturas(this.clienteSeleccionado);
        }
    }

    public cargarDeuda(cliente: any): void {
        this.mostrarClientes = false;
        this.servicio.cargarDeuda(cliente).subscribe(
            data => {
                this.movimientosDeuda = data;
                if (!data.length) {
                    this.errorMessage = 'Este cliente no tiene deuda';
                    console.log('Este cliente no tiene deuda');
                    return;
                }
                this.resumenDeuda.total = 0;
                this.resumenDeuda.impagados = 0;
                this.resumenDeuda.vencida = 0;
                this.resumenDeuda.abogado = 0;
                this.hoy = new Date();

                for (let mov of this.movimientosDeuda) {
                    if (mov.tipo.trim() === '4') {
                        this.resumenDeuda.impagados += mov.importePendiente;
                    }
                    if (mov.vencimiento < this.hoy.toISOString()) {
                        this.resumenDeuda.vencida += mov.importePendiente;
                    }
                    if ((!mov.estado) || (mov.estado && mov.estado.trim() !== "DVD")) {
                        this.resumenDeuda.total += mov.importePendiente;

                        if (mov.ruta && mov.ruta.trim() === 'AB') {
                            this.resumenDeuda.abogado += mov.importePendiente;
                        }
                    }
                }

                console.log(this.resumenDeuda);
            },
            error => this.errorMessage = <any>error
        );
    }

    public cargarFacturas(cliente: any): void {
        this.mostrarClientes = false;
        this.servicio.cargarFacturas(cliente).subscribe(
            data => {
                this.movimientosDeuda = data;
                if (!data.length) {
                    this.errorMessage = 'Este cliente no tiene facturas';
                    console.log('Este cliente no tiene facturas');
                    return;
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    public descargarFactura(movimiento: any): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Generando factura en PDF...',
        });

        loading.present();

        this.servicio.descargarFactura(movimiento.empresa, movimiento.documento).then(
            entry => {
                let alert = this.alertCtrl.create({
                    title: 'PDF generado',
                    subTitle: "Factura descargada: \n"+entry.toURL(),
                    buttons: ['Ok'],
                });
                alert.present();
                loading.dismiss();
                this.fileOpener.open(entry.toURL(), 'application/pdf');
            },
            error => {
                loading.dismiss();
                this.errorMessage = <any>error;
            }
        );
    }
}
