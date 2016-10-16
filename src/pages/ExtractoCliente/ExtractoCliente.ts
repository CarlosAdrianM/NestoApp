import {Component} from '@angular/core';
import {ExtractoClienteService} from './ExtractoCliente.service';

@Component({
    templateUrl: 'ExtractoCliente.html',
})
export class ExtractoCliente {
    private servicio: ExtractoClienteService;
    constructor(servicio: ExtractoClienteService) {
        this.servicio = servicio;
    };

    public mostrarClientes: boolean = true;
    public movimientosDeuda: any[];
    private errorMessage: string;
    public resumenDeuda: any = {};
    private hoy: Date;

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
                    // mov.vencimientoMostrar = new Date(mov.vencimiento);
                }

                console.log(this.resumenDeuda);
            },
            error => this.errorMessage = <any>error
        );
    }

}
