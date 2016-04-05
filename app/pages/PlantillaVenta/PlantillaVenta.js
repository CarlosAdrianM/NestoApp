var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var SelectorClientes_1 = require('../../componentes/SelectorClientes/SelectorClientes');
var SelectorPlantillaVenta_1 = require('../../componentes/SelectorPlantillaVenta/SelectorPlantillaVenta');
var PlantillaVentaDetalle_1 = require('./PlantillaVentaDetalle');
var PlantillaVenta = (function () {
    function PlantillaVenta(nav) {
        var _this = this;
        this.opcionesSlides = {
            allowSwipeToNext: false,
            onInit: function (slides) { return _this.slider = slides; },
        };
        this.nav = nav;
    }
    PlantillaVenta.prototype.cargarProductos = function (cliente) {
        this.clienteSeleccionado = cliente;
        this.slider.unlockSwipeToNext();
        this.slider.slideNext();
    };
    PlantillaVenta.prototype.abrirDetalle = function (producto) {
        console.log(producto);
        this.nav.push(PlantillaVentaDetalle_1.PlantillaVentaDetalle, { producto: producto });
    };
    PlantillaVenta = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
            directives: [SelectorClientes_1.SelectorClientes, SelectorPlantillaVenta_1.SelectorPlantillaVenta],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController])
    ], PlantillaVenta);
    return PlantillaVenta;
})();
exports.PlantillaVenta = PlantillaVenta;
