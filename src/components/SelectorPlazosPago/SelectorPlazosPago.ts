import {Component, Injectable, Input} from '@angular/core';
import {Select, List, Item, AlertController, NavController, LoadingController, Icon, Content, Option} from 'ionic-angular';
import {SelectorPlazosPagoService} from './SelectorPlazosPago.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-plazos-pago',
    templateUrl: 'SelectorPlazosPago.html',
    // inputs: ['seleccionado', 'cliente'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorPlazosPago extends SelectorBase {

    @Input() public seleccionado: any;
    @Input() public cliente: any;
    private nav: NavController;
    private servicio: SelectorPlazosPagoService;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;

    constructor(servicio: SelectorPlazosPagoService, nav: NavController, alertCtrl: AlertController, loadingCtrl: LoadingController) {
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
        this.servicio.getPlazosPago(this.cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'Error al cargar los plazos de pago',
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
