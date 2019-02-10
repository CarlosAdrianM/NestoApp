import {Component, Injectable, Input} from '@angular/core';
import {AlertController, LoadingController} from 'ionic-angular';
import {SelectorAlmacenesService} from './SelectorAlmacenes.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-almacenes',
    templateUrl: 'SelectorAlmacenes.html',
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorAlmacenesComponent extends SelectorBase {

    @Input() public cliente: any;
    @Input() public seleccionado: any;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorAlmacenesService;

    constructor(servicio: SelectorAlmacenesService, alertCtrl: AlertController, loadingCtrl: LoadingController) {
        super();
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        this.servicio.getAlmacenes(this.cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Error al cargar los almacenes',
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