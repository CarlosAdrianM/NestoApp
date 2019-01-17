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
import { Injectable, Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { SelectorBase } from "../SelectorBase/SelectorBase";
import { LoadingController, AlertController, NavController } from "ionic-angular";
import { SelectorProductosService } from "./SelectorProductos.service";
import { Keyboard } from '@ionic-native/keyboard';
import { ProductoComponent } from "../../pages/Producto/Producto.component";
var SelectorProductosComponent = /** @class */ (function (_super) {
    __extends(SelectorProductosComponent, _super);
    function SelectorProductosComponent(servicio, loadingCtrl, alertCtrl, keyboard, nav) {
        var _this = _super.call(this) || this;
        _this.servicio = servicio;
        _this.loadingCtrl = loadingCtrl;
        _this.alertCtrl = alertCtrl;
        _this.keyboard = keyboard;
        _this.nav = nav;
        _this.seleccionar = new EventEmitter();
        return _this;
    }
    SelectorProductosComponent.prototype.ngAfterViewInit = function () {
        this.setFocus();
    };
    SelectorProductosComponent.prototype.setFocus = function () {
        var _this = this;
        setTimeout(function () {
            _this.myIonSearchBar.setFocus();
            _this.keyboard.show();
        }, 0);
    };
    SelectorProductosComponent.prototype.cargarDatos = function (filtro) {
        /*
        let filtros: string[];
        filtros.push(this.filtroNombre);
        filtros.push(this.filtroFamilia);
        filtros.push(this.filtroSubgrupo);
        */
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Cargando Productos...',
        });
        loading.present();
        this.servicio.getProductos(filtro).subscribe(function (data) {
            if (data.length === 0) {
                var alert_1 = _this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se encuentra ningún producto con esos filtros',
                    buttons: ['Ok'],
                });
                alert_1.present();
            }
            else {
                _this.inicializarDatos(data);
            }
            loading.dismiss();
        }, function (error) {
            // loading.dismiss();
            _this.errorMessage = error;
            loading.dismiss();
        }, function () {
        });
    };
    SelectorProductosComponent.prototype.abrirFichaProducto = function (producto) {
        this.nav.push(ProductoComponent, { empresa: "1", producto: producto.producto });
    };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], SelectorProductosComponent.prototype, "seleccionar", void 0);
    __decorate([
        ViewChild('barra'),
        __metadata("design:type", Object)
    ], SelectorProductosComponent.prototype, "myIonSearchBar", void 0);
    SelectorProductosComponent = __decorate([
        Component({
            selector: 'selector-productos',
            templateUrl: 'SelectorProductos.html'
        }),
        Injectable(),
        __metadata("design:paramtypes", [SelectorProductosService, LoadingController,
            AlertController, Keyboard, NavController])
    ], SelectorProductosComponent);
    return SelectorProductosComponent;
}(SelectorBase));
export { SelectorProductosComponent };
//# sourceMappingURL=SelectorProductos.component.js.map