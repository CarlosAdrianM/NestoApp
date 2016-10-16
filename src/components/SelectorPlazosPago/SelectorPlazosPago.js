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
var SelectorPlazosPago_service_1 = require('./SelectorPlazosPago.service');
var SelectorBase_1 = require('../SelectorBase/SelectorBase');
var SelectorPlazosPago = (function (_super) {
    __extends(SelectorPlazosPago, _super);
    function SelectorPlazosPago(servicio, nav) {
        _super.call(this);
        this.nav = nav;
        this.servicio = servicio;
    }
    SelectorPlazosPago.prototype.ngOnInit = function () {
        this.cargarDatos();
    };
    SelectorPlazosPago.prototype.cargarDatos = function () {
        var _this = this;
        /*
        let loading: any = Loading.create({
            content: 'Cargando Plazos de Pago...',
        });

        this.nav.present(loading);
        */
        this.servicio.getPlazosPago(this.cliente).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = ionic_angular_1.Alert.create({
                    title: 'Error',
                    subTitle: 'Error al cargar los plazos de pago',
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
    ], SelectorPlazosPago.prototype, "seleccionado", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], SelectorPlazosPago.prototype, "cliente", void 0);
    SelectorPlazosPago = __decorate([
        core_1.Component({
            selector: 'selector-plazos-pago',
            templateUrl: 'build/componentes/SelectorPlazosPago/SelectorPlazosPago.html',
            directives: [ionic_angular_1.Select, ionic_angular_1.Item, ionic_angular_1.Icon, ionic_angular_1.Content, ionic_angular_1.Option],
            providers: [SelectorPlazosPago_service_1.SelectorPlazosPagoService],
            inputs: ['seleccionado', 'cliente'],
            outputs: ['seleccionar'],
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SelectorPlazosPago_service_1.SelectorPlazosPagoService, ionic_angular_1.NavController])
    ], SelectorPlazosPago);
    return SelectorPlazosPago;
}(SelectorBase_1.SelectorBase));
exports.SelectorPlazosPago = SelectorPlazosPago;
