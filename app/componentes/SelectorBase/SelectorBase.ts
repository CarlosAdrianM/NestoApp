import {Output, EventEmitter} from 'angular2/core';

export abstract class SelectorBase {

    private datos: any[];
    private datosFiltrados: any[];
    private datosInicial: any[];

    @Output() public seleccionar: EventEmitter<any> = new EventEmitter();

    public seleccionarDato(dato: any): void {
        this.seleccionar.emit(dato);
    }

    public filtrarBusqueda(searchbar: any): void {
        let filtro: string = searchbar.value.toUpperCase();

        if (this.datos) {
            this.datosFiltrados = this.aplicarFiltro(this.datos, filtro);
        }
    }

    public fijarFiltro(searchbar: any): void {
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

    public abstract cargarDatos(filtro: any): void;

    public inicializarDatos(datos: any[]): void {
        this.datos = datos; // ¿vale para algo?
        this.datosInicial = datos;
        this.datosFiltrados = datos;
    }

    public inicializarDatosFiltrados(datos: any[]): void {
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

    public datosIniciales(): any[] {
        return this.datosInicial;
    }

    public resetearFiltros(): void {
        this.inicializarDatos([]);
    }

    public agregarDato(dato: any): void {
        if (this.datosInicial.indexOf(dato) === -1) {
            this.datosInicial.push(dato);
        }
    }

    public numeroDeDatos(): number {
        return this.datosFiltrados ? this.datosFiltrados.length : 0;
    }
}
