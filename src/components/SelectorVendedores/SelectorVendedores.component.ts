import { Component, Injectable, Input } from '@angular/core';
import { AlertController, NavController, LoadingController } from 'ionic-angular';
import { SelectorVendedoresService } from './SelectorVendedores.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-vendedores',
    templateUrl: 'SelectorVendedores.html',
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorVendedoresComponent extends SelectorBase {

    @Input() public seleccionado: any;
    @Input() public etiqueta: any;
    private nav: NavController;
    private servicio: SelectorVendedoresService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;

    constructor(servicio: SelectorVendedoresService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
        super();
        this.nav = nav;
        this.servicio = servicio;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        this.servicio.getVendedores().subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Error al cargar vendedores',
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
