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
var SelectorPlantillaVenta_service_1 = require('./SelectorPlantillaVenta.service');
var SelectorPlantillaVentaDetalle = (function () {
    function SelectorPlantillaVentaDetalle(servicio, nav, navParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.producto = navParams.get('producto');
        this.servicio = servicio;
        if (!this.producto.stockActualizado) {
            this.comprobarSiExisteElProducto(this.producto);
        }
    }
    SelectorPlantillaVentaDetalle.prototype.comprobarSiExisteElProducto = function (producto) {
        var _this = this;
        this.servicio.cargarStockProducto(this.producto).subscribe(function (data) {
            producto.stockActualizado = true;
            producto.stock = data.stock;
            producto.cantidadDisponible = data.cantidadDisponible;
            producto.urlImagen = data.urlImagen;
            _this.seleccionarColorStock(producto);
        }, function (error) { return _this.errorMessage = error; });
    };
    SelectorPlantillaVentaDetalle.prototype.seleccionarColorStock = function (producto) {
        if (producto.cantidadDisponible >= producto.cantidad + producto.cantidadOferta) {
            producto.colorStock = 'secondary';
        }
        else if (producto.stock >= producto.cantidad + producto.cantidadOferta) {
            producto.colorStock = 'primary';
        }
        else {
            producto.colorStock = 'danger';
        }
    };
    SelectorPlantillaVentaDetalle = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/componentes/SelectorPlantillaVenta/SelectorPlantillaVentaDetalle.html',
            providers: [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService],
        }), 
        __metadata('design:paramtypes', [SelectorPlantillaVenta_service_1.SelectorPlantillaVentaService, ionic_angular_1.NavController, ionic_angular_1.NavParams])
    ], SelectorPlantillaVentaDetalle);
    return SelectorPlantillaVentaDetalle;
})();
exports.SelectorPlantillaVentaDetalle = SelectorPlantillaVentaDetalle;
