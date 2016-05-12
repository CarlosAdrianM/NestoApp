﻿import {Output, EventEmitter} from 'angular2/core';

export abstract class SelectorBase {

    private datos: any[];
    private datosFiltrados: any[];
    private datosInicial: any[];
    protected errorMessage: string;

    @Output() private seleccionar: EventEmitter<any> = new EventEmitter();

    protected seleccionarDato(dato: any): void {
        this.seleccionar.emit(dato);
    }

    private filtrarBusqueda(searchbar: any): void {
        let filtro: string = searchbar.value.toUpperCase();

        if (this.datos) {
            this.datosFiltrados = this.aplicarFiltro(this.datos, filtro);
        }
    }

    private fijarFiltro(searchbar: any): void {
        let filtro: string = searchbar.target.value.toUpperCase();
        if (!this.datosInicial || this.datosInicial.length === 0) {
            this.cargarDatos(filtro);
        } else if (filtro === '') {
            this.datos = this.datosInicial;
            this.datosFiltrados = this.datosInicial;
        } else {
            this.datos = this.aplicarFiltro(this.datos, filtro);
            this.datosFiltrados = this.datos;
        }
        searchbar.target.select();
    }

    private aplicarFiltro(datos: any[], filtro: string): any[] {
        return datos.filter(
            f => Object.keys(f).some(
                (key) => (f[key] && (typeof f[key] === 'string' || f[key] instanceof String)) ?
                    f[key].toUpperCase().indexOf(filtro) > -1 : false
            )
        );
    }

    protected abstract cargarDatos(filtro: any): void;

    protected inicializarDatos(datos: any[]): void {
        this.datos = datos; // ¿vale para algo?
        this.datosInicial = datos;
        this.datosFiltrados = datos;
    }

    protected inicializarDatosFiltrados(datos: any[]): void {
        this.datosFiltrados = datos;
        let i: number;
        let posicion: number;

        for (i = 0; i < this.datosFiltrados.length; i++) {
            posicion = this.datosInicial.map(function (e: any): any { return e.producto; }).indexOf(this.datosFiltrados[i].producto);
            if (posicion !== -1) { // el dato ya está en datosInicial
                this.datosFiltrados[i] = this.datosInicial[posicion];
            }
        }
    }

    protected datosIniciales(): any[] {
        return this.datosInicial;
    }

    public resetearFiltros(): void {
        this.inicializarDatos([]);
    }

    protected agregarDato(dato: any): boolean {
        if (this.datosInicial.indexOf(dato) === -1) {
            this.datosInicial.push(dato);
            return true;
        } else {
            return false;
        }
    }

    public numeroDeDatos(): number {
        return this.datosFiltrados ? this.datosFiltrados.length : 0;
    }

    public seleccionarTexto(evento: any): void {
        evento.inputElement ? evento.inputElement.select() : evento.target.select();
    }
}
