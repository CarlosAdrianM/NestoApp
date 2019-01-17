var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ListaRapportsService } from './ListaRapports.service';
import { SelectorBase } from '../../components/SelectorBase/SelectorBase';
import { Usuario } from '../../models/Usuario';
import { RapportComponent } from '../Rapport/Rapport.component';
import { Configuracion } from '../../components/configuracion/configuracion';
var ListaRapports = /** @class */ (function (_super) {
    __extends(ListaRapports, _super);
    function ListaRapports(servicio, nav, alertCtrl, loadingCtrl, usuario) {
        var _this = _super.call(this) || this;
        _this.usuario = usuario;
        _this.segmentoRapports = 'cliente';
        _this.hoy = new Date();
        _this.fechaRapports = _this.hoy.toISOString().slice(0, 10);
        _this.numeroCliente = "";
        _this.servicio = servicio;
        _this.nav = nav;
        _this.alertCtrl = alertCtrl;
        _this.loadingCtrl = loadingCtrl;
        _this.clienteRapport = "";
        _this.contactoRapport = "0";
        return _this;
    }
    ListaRapports.prototype.actualizarCliente = function () {
        if (this.numeroCliente == null || this.numeroCliente.trim() == "") {
            return;
        }
        this.clienteRapport = this.numeroCliente;
    };
    ListaRapports.prototype.seleccionarContacto = function (evento) {
        if (!this.clienteRapport) {
            return;
        }
        this.cargarDatosCliente(this.clienteRapport, evento.contacto);
    };
    ListaRapports.prototype.cargarDatos = function () {
        //para que implemente el interface
    };
    ListaRapports.prototype.cargarDatosFecha = function (fecha) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });
        loading.present();
        this.servicio.cargarListaFecha(fecha).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No hay ningún rapport para listar en esa fecha',
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
    ListaRapports.prototype.cargarDatosCliente = function (cliente, contacto) {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Rapports...',
        });
        loading.present();
        this.servicio.cargarListaCliente(cliente, contacto).subscribe(function (data) {
            if (data.length === 0) {
                var alert_2 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No hay ningún rapport de ese cliente para listar',
                    buttons: ['Ok'],
                });
                alert_2.present();
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
        rapport.Id = 0;
        rapport.Fecha = this.fechaRapports;
        rapport.Empresa = Configuracion.EMPRESA_POR_DEFECTO;
        //rapport.Vendedor = this.usuario.vendedor; // tiene que ser el del cliente desde la API
        rapport.Tipo = "V"; // Visita
        rapport.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
        rapport.TipoCentro = 0; // No se sabe
        rapport.Estado = 0; // Vigente
        this.abrirRapport(rapport);
    };
    ListaRapports.prototype.ionViewDidLoad = function () {
        var _this = this;
        setTimeout(function () {
            _this.myClienteInput.setFocus();
        }, 150);
    };
    ListaRapports.prototype.cambiarSegmento = function () {
        var _this = this;
        if (this.segmentoRapports == 'fecha') {
            if (this.datosFiltrados == null || this.datosFiltrados.length == 0) {
                this.cargarDatosFecha(this.fechaRapports);
            }
        }
        else {
            setTimeout(function () {
                _this.myClienteInput.setFocus();
            }, 150);
        }
    };
    __decorate([
        ViewChild('clienteInput'),
        __metadata("design:type", Object)
    ], ListaRapports.prototype, "myClienteInput", void 0);
    ListaRapports = __decorate([
        Component({
            templateUrl: 'ListaRapports.html',
        }),
        __metadata("design:paramtypes", [ListaRapportsService, NavController, AlertController, LoadingController, Usuario])
    ], ListaRapports);
    return ListaRapports;
}(SelectorBase));
export { ListaRapports };
//# sourceMappingURL=ListaRapports.component.js.map