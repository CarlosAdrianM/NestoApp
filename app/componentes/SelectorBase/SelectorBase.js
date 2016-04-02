var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var SelectorBase = (function () {
    function SelectorBase() {
        this.seleccionar = new core_1.EventEmitter();
    }
    SelectorBase.prototype.seleccionarDato = function (dato) {
        this.seleccionar.emit(dato);
    };
    SelectorBase.prototype.filtrarBusqueda = function (filtro) {
        if (this.datosInicial) {
        }
        else {
            this.cargarDatos(filtro);
            this.datosInicial = this.datos;
        }
    };
    SelectorBase.prototype.fijarFiltro = function (filtro) {
        if (this.filtroDatos === '') {
            this.datos = this.datosInicial;
        }
        else {
            //angular.copy($scope.model.productosFiltrados, $scope.productos);
            this.datos = this.datos.filter(function (f) { return f.texto.contains(filtro); });
        }
        this.filtroDatos = '';
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], SelectorBase.prototype, "seleccionar", void 0);
    return SelectorBase;
})();
exports.SelectorBase = SelectorBase;
