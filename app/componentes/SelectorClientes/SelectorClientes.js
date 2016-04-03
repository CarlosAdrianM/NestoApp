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
var SelectorClientes_service_1 = require('./SelectorClientes.service');
var SelectorBase_1 = require('../SelectorBase/SelectorBase');
var SelectorClientes = (function (_super) {
    __extends(SelectorClientes, _super);
    function SelectorClientes(servicio, nav) {
        _super.call(this);
        this.servicio = servicio;
        this.nav = nav;
    }
    SelectorClientes.prototype.cargarDatos = function (filtro) {
        var _this = this;
        this.servicio.getClientes(filtro).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'No se encuentra ningún cliente que coincida con ' + filtro,
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_1);
            }
            else {
                _this.inicializarDatos(data);
            }
        }, function (error) { return _this.errorMessage = error; });
    };
    SelectorClientes.prototype.seleccionarCliente = function (cliente) {
        this.seleccionar.emit(cliente);
    };
    SelectorClientes = __decorate([
        core_1.Component({
            selector: 'selector-clientes',
            templateUrl: 'build/componentes/SelectorClientes/SelectorClientes.html',
            directives: [ionic_angular_1.Searchbar, ionic_angular_1.List, ionic_angular_1.Item],
            providers: [SelectorClientes_service_1.SelectorClientesService],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SelectorClientes_service_1.SelectorClientesService, ionic_angular_1.NavController])
    ], SelectorClientes);
    return SelectorClientes;
})(SelectorBase_1.SelectorBase);
exports.SelectorClientes = SelectorClientes;
