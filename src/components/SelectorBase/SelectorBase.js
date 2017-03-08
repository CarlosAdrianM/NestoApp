var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Output, EventEmitter } from '@angular/core';
var SelectorBase = (function () {
    function SelectorBase() {
        this.seleccionar = new EventEmitter();
    }
    SelectorBase.prototype.seleccionarDato = function (dato) {
        this.seleccionar.emit(dato);
    };
    SelectorBase.prototype.filtrarBusqueda = function (searchbar) {
        var filtro;
        if (searchbar.target.value) {
            filtro = searchbar.target.value.toUpperCase();
        }
        else {
            filtro = "";
        }
        if (this.datos) {
            this.datosFiltrados = this.aplicarFiltro(this.datos, filtro);
        }
    };
    SelectorBase.prototype.fijarFiltro = function (searchbar) {
        var filtro = searchbar.target.value.toUpperCase();
        if (!this.datosInicial || this.datosInicial.length === 0) {
            this.cargarDatos(filtro);
        }
        else if (filtro === '') {
            this.datos = this.datosInicial;
            this.datosFiltrados = this.datosInicial;
        }
        else {
            this.datos = this.aplicarFiltro(this.datos, filtro);
            this.datosFiltrados = this.datos;
        }
        searchbar.target.select();
    };
    SelectorBase.prototype.aplicarFiltro = function (datos, filtro) {
        return datos.filter(function (f) { return Object.keys(f).some(function (key) { return (f[key] && (typeof f[key] === 'string' || f[key] instanceof String)) ?
            f[key].toUpperCase().indexOf(filtro) > -1 :
            (f[key] && typeof f[key] === 'number' && !isNaN(parseFloat(filtro))) ? f[key] === parseFloat(filtro) :
                false; }); });
    };
    SelectorBase.prototype.inicializarDatos = function (datos) {
        this.datos = datos; // ¿vale para algo?
        this.datosInicial = datos;
        this.datosFiltrados = datos;
    };
    SelectorBase.prototype.inicializarDatosFiltrados = function (datos) {
        this.datos = datos;
        this.datosFiltrados = datos;
        var i;
        var posicion;
        for (i = 0; i < this.datosFiltrados.length; i++) {
            posicion = this.datosInicial.map(function (e) { return e.producto; }).indexOf(this.datosFiltrados[i].producto);
            if (posicion !== -1) {
                this.datosFiltrados[i] = this.datosInicial[posicion];
            }
        }
    };
    SelectorBase.prototype.datosIniciales = function () {
        return this.datosInicial;
    };
    SelectorBase.prototype.resetearFiltros = function () {
        this.inicializarDatos([]);
    };
    SelectorBase.prototype.agregarDato = function (dato) {
        if (this.datosInicial.indexOf(dato) === -1) {
            this.datosInicial.push(dato);
            return true;
        }
        else {
            return false;
        }
    };
    SelectorBase.prototype.numeroDeDatos = function () {
        return this.datosFiltrados ? this.datosFiltrados.length : 0;
    };
    SelectorBase.prototype.seleccionarTexto = function (evento) {
        evento.inputElement ? evento.inputElement.select() : evento.target.select();
    };
    return SelectorBase;
}());
export { SelectorBase };
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], SelectorBase.prototype, "seleccionar", void 0);
//# sourceMappingURL=SelectorBase.js.map