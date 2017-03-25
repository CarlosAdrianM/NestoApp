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
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
import { RapportComponent } from '../Rapport/Rapport.component';
var ListaRapports = (function (_super) {
    __extends(ListaRapports, _super);
    function ListaRapports(servicio, nav, alertCtrl, loadingCtrl) {
        var _this = _super.call(this) || this;
        _this.segmentoRapports = 'cliente';
        _this.fechaRapports = new Date().toISOString();
        _this.servicio = servicio;
        _this.nav = nav;
        _this.alertCtrl = alertCtrl;
        _this.loadingCtrl = loadingCtrl;
        return _this;
    }
    ListaRapports.prototype.cargarDatos = function (fecha) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });
        loading.present();
        this.servicio.cargarLista(fecha).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No hay ningún pedido rapport para listar',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.inicializarDatos(data);
            }
        }, function (error) {
            loading.dismiss();
            _this.errorMessage = error;
        }, function () {
            loading.dismiss();
        });
    };
    ListaRapports.prototype.abrirRapport = function (rapport) {
        this.nav.push(RapportComponent, { rapport: rapport });
    };
    ListaRapports.prototype.annadirRapport = function () {
        var rapport = new Object();
        rapport.Fecha = this.fechaRapports;
        rapport.Tipo = "V";
        //rapport.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
        this.abrirRapport(rapport);
    };
    return ListaRapports;
}(SelectorBase));
ListaRapports = __decorate([
    Component({
        templateUrl: 'ListaRapports.html',
    }),
    __metadata("design:paramtypes", [ListaRapportsService, NavController, AlertController, LoadingController])
], ListaRapports);
export { ListaRapports };
//# sourceMappingURL=ListaRapports.Component.js.map