"use strict";
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
var core_1 = require('@angular/core');
var ionic_angular_1 = require('ionic-angular');
var SelectorFormasPago_service_1 = require('./SelectorFormasPago.service');
var SelectorBase_1 = require('../SelectorBase/SelectorBase');
var SelectorFormasPago = (function (_super) {
    __extends(SelectorFormasPago, _super);
    function SelectorFormasPago(servicio, nav) {
        _super.call(this);
        this.nav = nav;
        this.servicio = servicio;
    }
    SelectorFormasPago.prototype.ngOnInit = function () {
        this.cargarDatos();
    };
    SelectorFormasPago.prototype.cargarDatos = function () {
        var _this = this;
        this.servicio.getFormasPago(this.cliente).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'Error al cargar las formas de pago',
                    buttons: ['Ok'],
                });
                _this.nav.present(alert_1);
            }
            else {
                _this.inicializarDatos(data);
            }
        }, function (error) {
            // loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            // loading.dismiss();
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectorFormasPago.prototype, "cliente", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectorFormasPago.prototype, "seleccionado", void 0);
    SelectorFormasPago = __decorate([
        core_1.Component({
            selector: 'selector-formas-pago',
            templateUrl: 'build/componentes/SelectorFormasPago/SelectorFormasPago.html',
            directives: [ionic_angular_1.Select, ionic_angular_1.Item, ionic_angular_1.Icon, ionic_angular_1.Content, ionic_angular_1.Option],
            providers: [SelectorFormasPago_service_1.SelectorFormasPagoService],
            inputs: ['cliente', 'seleccionado'],
            outputs: ['seleccionar'],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SelectorFormasPago_service_1.SelectorFormasPagoService, ionic_angular_1.NavController])
    ], SelectorFormasPago);
    return SelectorFormasPago;
}(SelectorBase_1.SelectorBase));
exports.SelectorFormasPago = SelectorFormasPago;
