import {Component, Injectable, Input} from '@angular/core';
import {Select, Item, AlertController, LoadingController, Icon, Content, Option} from 'ionic-angular';
import {SelectorFormasPagoService} from './SelectorFormasPago.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-formas-pago',
    templateUrl: 'SelectorFormasPago.html',
    // inputs: ['cliente', 'seleccionado'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorFormasPago extends SelectorBase {

    @Input() public cliente: any;
    @Input() public seleccionado: any;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorFormasPagoService;

    constructor(servicio: SelectorFormasPagoService, alertCtrl: AlertController, loadingCtrl: LoadingController) {
        super();
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        this.servicio.getFormasPago(this.cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Error al cargar las formas de pago',
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => {
                // loading.dismiss();
                this.errorMessage = <any>error;
            },
            () => {
                // loading.dismiss();
            }
        );
    }
}