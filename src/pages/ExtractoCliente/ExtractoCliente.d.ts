import { ExtractoClienteService } from './ExtractoCliente.service';
export declare class ExtractoCliente {
    private servicio;
    constructor(servicio: ExtractoClienteService);
    mostrarClientes: boolean;
    movimientosDeuda: any[];
    private errorMessage;
    resumenDeuda: any;
    private hoy;
    cargarDeuda(cliente: any): void;
}
