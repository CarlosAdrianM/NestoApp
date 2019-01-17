import { EventEmitter } from '@angular/core';
export declare abstract class SelectorBase {
    private datos;
    datosFiltrados: any[];
    private datosInicial;
    protected errorMessage: string;
    seleccionar: EventEmitter<any>;
    seleccionarDato(dato: any): void;
    filtrarBusqueda(searchbar: any): void;
    fijarFiltro(searchbar: any): void;
    protected aplicarFiltro(datos: any[], filtro: string): any[];
    protected abstract cargarDatos(filtro: any): void;
    protected inicializarDatos(datos: any[]): void;
    protected inicializarDatosFiltrados(datos: any[]): void;
    protected datosIniciales(): any[];
    resetearFiltros(): void;
    protected agregarDato(dato: any): boolean;
    numeroDeDatos(): number;
    seleccionarTexto(evento: any): void;
}
