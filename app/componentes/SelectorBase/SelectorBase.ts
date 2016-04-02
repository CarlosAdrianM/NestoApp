import {Output, EventEmitter} from 'angular2/core';

export abstract class SelectorBase {

    private datos: any[];
    private datosInicial: any[];
    private errorMessage: string;
    private filtroDatos: string;

    @Output() private seleccionar: EventEmitter<any> = new EventEmitter();

    public seleccionarDato(dato: any): void {
        this.seleccionar.emit(dato);
    }

    public filtrarBusqueda(filtro: string): void {
        if (this.datosInicial) {
            //filtrar datos
        } else {
            this.cargarDatos(filtro);
            this.datosInicial = this.datos;
        }
    }

    public fijarFiltro(filtro: string): void {
        if (this.filtroDatos === '') {
            this.datos = this.datosInicial;
        } else {
            //angular.copy($scope.model.productosFiltrados, $scope.productos);
            this.datos = this.datos.filter(f => f.texto.contains(filtro));
        }
        this.filtroDatos = '';
    }

    public abstract cargarDatos(filtro: string): void;

}
