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
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RapportService } from './Rapport.service';
var RapportComponent = (function () {
    function RapportComponent(navParams, servicio, alertCtrl, loadingCtrl) {
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.submitted = false;
        this.rapport = navParams.get('rapport');
        // Esto debería hacerlo la API directamente
        if (this.rapport && this.rapport.Tipo) {
            this.rapport.Tipo = this.rapport.Tipo.trim();
        }
    }
    RapportComponent.prototype.onSubmit = function () { this.submitted = true; };
    RapportComponent.prototype.seleccionarTexto = function (evento) {
        evento.target.select();
    };
    RapportComponent.prototype.modificarRapport = function () {
        var _this = this;
        var confirm = this.alertCtrl.create({
            title: 'Confirmar',
            message: '¿Está seguro que quiere guardar el rapport?',
            buttons: [
                {
                    text: 'Sí',
                    handler: function () {
                        // Hay que guardar el pedido original en alguna parte
                        var loading = _this.loadingCtrl.create({
                            content: 'Modificando Pedido...',
                        });
                        loading.present();
                        _this.servicio.crearRapport(_this.rapport).subscribe(function (data) {
                            var alert = _this.alertCtrl.create({
                                title: 'Creado',
                                subTitle: 'Rapport creado correctamente',
                                buttons: ['Ok'],
                            });
                            alert.present();
                            loading.dismiss();
                            // this.reinicializar();
                        }, function (error) {
                            var alert = _this.alertCtrl.create({
                                title: 'Error',
                                subTitle: 'No se ha podido crear el rapport.\n' + error,
                                buttons: ['Ok'],
                            });
                            alert.present();
                            loading.dismiss();
                        }, function () {
                            //loading.dismiss();
                        });
                    }
                },
                {
                    text: 'No',
                    handler: function () {
                        return;
                    }
                }
            ]
        });
        confirm.present();
    };
    return RapportComponent;
}());
RapportComponent = __decorate([
    Component({
        templateUrl: 'Rapport.html',
    }),
    __metadata("design:paramtypes", [NavParams, RapportService, AlertController, LoadingController])
], RapportComponent);
export { RapportComponent };
//# sourceMappingURL=Rapport.component.js.map