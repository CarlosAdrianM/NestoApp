var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { ComisionesService } from './Comisiones.service';
import { ComisionesDetalleComponent } from '../ComisionesDetalle/ComisionesDetalle.component';
import { Usuario } from '../../models/Usuario';
var ComisionesComponent = /** @class */ (function () {
    function ComisionesComponent(servicio, nav, navParams, alertCtrl, loadingCtrl, usuario) {
        this.servicio = servicio;
        this.nav = nav;
        this.navParams = navParams;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.usuario = usuario;
        this.hoy = new Date();
        this.mesActual = this.hoy.getMonth();
        this.mesSeleccionado = this.hoy.getMonth();
        this.annoActual = this.hoy.getFullYear();
        this.annoSeleccionado = this.hoy.getFullYear();
        this.nombreMesSeleccionado = this.hoy.toLocaleDateString('es-ES', { month: 'long' });
        this.incluirAlbaranes = true;
        this.deshabilitarIncluirAlbaranes = false;
        this.vendedorSeleccionado = usuario.vendedor;
    }
    ComisionesComponent.prototype.ngOnInit = function () {
        this.cargarResumen();
    };
    ;
    ComisionesComponent.prototype.seleccionarVendedor = function (vendedor) {
        this.vendedorSeleccionado = vendedor;
        this.cargarResumen();
    };
    ComisionesComponent.prototype.cargarResumen = function () {
        var _this = this;
        if (!this.vendedorSeleccionado) {
            return;
        }
        //this.resumen = this.servicio.cargarPrueba();
        var loading = this.loadingCtrl.create({
            content: 'Cargando Comisiones...',
        });
        loading.present();
        this.servicio.cargarResumen(this.vendedorSeleccionado, this.mesSeleccionado + 1, this.annoSeleccionado, this.incluirAlbaranes)
            .subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se han cargado correctamente las comisiones',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.resumen = data;
            }
        }, function (error) {
            loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    ComisionesComponent.prototype.abrirDetalle = function (etiqueta) {
        this.nav.push(ComisionesDetalleComponent, {
            vendedor: this.vendedorSeleccionado, anno: this.annoSeleccionado, mes: this.mesSeleccionado + 1,
            incluirAlbaranes: this.incluirAlbaranes, etiqueta: etiqueta
        });
    };
    ComisionesComponent.prototype.doCheckbox = function () {
        var _this = this;
        var alert = this.alertCtrl.create();
        alert.setTitle('Seleccione el mes deseado');
        alert.addInput({
            type: 'radio',
            label: 'Enero',
            value: '0',
            checked: this.mesSeleccionado == 0
        });
        alert.addInput({
            type: 'radio',
            label: 'Febrero',
            value: '1',
            checked: this.mesSeleccionado == 1
        });
        alert.addInput({
            type: 'radio',
            label: 'Marzo',
            value: '2',
            checked: this.mesSeleccionado == 2
        });
        alert.addInput({
            type: 'radio',
            label: 'Abril',
            value: '3',
            checked: this.mesSeleccionado == 3
        });
        alert.addInput({
            type: 'radio',
            label: 'Mayo',
            value: '4',
            checked: this.mesSeleccionado == 4
        });
        alert.addInput({
            type: 'radio',
            label: 'Junio',
            value: '5',
            checked: this.mesSeleccionado == 5
        });
        alert.addInput({
            type: 'radio',
            label: 'Julio',
            value: '6',
            checked: this.mesSeleccionado == 6
        });
        alert.addInput({
            type: 'radio',
            label: 'Agosto',
            value: '7',
            checked: this.mesSeleccionado == 7
        });
        alert.addInput({
            type: 'radio',
            label: 'Septiembre',
            value: '8',
            checked: this.mesSeleccionado == 8
        });
        alert.addInput({
            type: 'radio',
            label: 'Octubre',
            value: '9',
            checked: this.mesSeleccionado == 9
        });
        alert.addInput({
            type: 'radio',
            label: 'Noviembre',
            value: '10',
            checked: this.mesSeleccionado == 10
        });
        alert.addInput({
            type: 'radio',
            label: 'Diciembre',
            value: '11',
            checked: this.mesSeleccionado == 11
        });
        alert.addButton('Cancelar');
        alert.addButton({
            text: 'OK',
            handler: function (data) {
                _this.mesSeleccionado = +data;
                if (_this.mesSeleccionado <= _this.mesActual) {
                    _this.annoSeleccionado = _this.annoActual;
                }
                else {
                    _this.annoSeleccionado = _this.annoActual - 1;
                }
                _this.deshabilitarIncluirAlbaranes = _this.mesActual != _this.mesSeleccionado;
                var fechaNombreMes = new Date(_this.annoSeleccionado, _this.mesSeleccionado);
                _this.nombreMesSeleccionado = fechaNombreMes.toLocaleDateString('es-ES', { month: 'long' }) + " " + _this.annoSeleccionado;
                if (_this.incluirAlbaranes == _this.deshabilitarIncluirAlbaranes) {
                    _this.incluirAlbaranes = !_this.deshabilitarIncluirAlbaranes;
                }
                else {
                    _this.cargarResumen();
                }
            }
        });
        alert.present().then(function () {
            _this.testCheckboxOpen = true;
        });
    };
    ComisionesComponent.prototype.colorRango = function (rojo) {
        return rojo ? 'danger' : 'secondary';
    };
    ComisionesComponent = __decorate([
        Component({
            templateUrl: 'Comisiones.html',
        }),
        __metadata("design:paramtypes", [ComisionesService, NavController,
            NavParams, AlertController,
            LoadingController, Usuario])
    ], ComisionesComponent);
    return ComisionesComponent;
}());
export { ComisionesComponent };
//# sourceMappingURL=Comisiones.component.js.map