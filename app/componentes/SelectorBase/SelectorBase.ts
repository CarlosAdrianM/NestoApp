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

        if (this.datos && filtro.length >= 3) {
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
        filtro = '';
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
        this.datos = datos;
        this.datosInicial = datos;
        this.datosFiltrados = datos;
    }

    public resetearFiltros(): void {
        this.inicializarDatos([]);
    }

}
