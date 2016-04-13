var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var ionic_angular_1 = require('ionic-angular');
var SelectorDireccionesEntrega_service_1 = require('./SelectorDireccionesEntrega.service');
var SelectorBase_1 = require('../SelectorBase/SelectorBase');
var SelectorDireccionesEntrega = (function (_super) {
    __extends(SelectorDireccionesEntrega, _super);
    function SelectorDireccionesEntrega(servicio, nav) {
        _super.call(this);
        this.servicio = servicio;
        this.nav = nav;
    }
    SelectorDireccionesEntrega.prototype.cargarDatos = function (cliente) {
        var _this = this;
        this.servicio.direccionesEntrega(cliente).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'El cliente ' + cliente.cliente + ' no tiene ninguna dirección de entrega',
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_1);
            }
            else {
                _this.direccionesEntrega = data;
                _this.direccionSeleccionada = undefined;
                var i = 0;
                while (_this.direccionSeleccionada === undefined) {
                    if (i + 1 > _this.direccionesEntrega.length) {
                        throw 'Error en la API de Nesto: cliente sin dirección por defecto';
                    }
                    if (_this.direccionesEntrega[i].esDireccionPorDefecto) {
                        _this.direccionSeleccionada = _this.direccionesEntrega[i];
                    }
                    i++;
                }
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    SelectorDireccionesEntrega.prototype.seleccionarDireccion = function (cliente) {
        this.seleccionar.emit(cliente);
    };
    SelectorDireccionesEntrega.prototype.ngOnChanges = function () {
        this.cargarDatos(this.cliente);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectorDireccionesEntrega.prototype, "cliente", void 0);
    SelectorDireccionesEntrega = __decorate([
        core_1.Component({
            selector: 'selector-direcciones-entrega',
            templateUrl: 'build/componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega.html',
            directives: [ionic_angular_1.Searchbar, ionic_angular_1.List, ionic_angular_1.Item, ionic_angular_1.Icon],
            providers: [SelectorDireccionesEntrega_service_1.SelectorDireccionesEntregaService],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SelectorDireccionesEntrega_service_1.SelectorDireccionesEntregaService, ionic_angular_1.NavController])
    ], SelectorDireccionesEntrega);
    return SelectorDireccionesEntrega;
})(SelectorBase_1.SelectorBase);
exports.SelectorDireccionesEntrega = SelectorDireccionesEntrega;
