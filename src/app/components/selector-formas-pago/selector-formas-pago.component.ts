import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorFormasPagoService } from './selector-formas-pago.service';

@Component({
  selector: 'selector-formas-pago',
  templateUrl: './selector-formas-pago.component.html',
  styleUrls: ['./selector-formas-pago.component.scss'],
})
export class SelectorFormasPagoComponent extends SelectorBase implements OnInit {

    @Input() public cliente: any;
    @Input() public seleccionado: any;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;
    private servicio: SelectorFormasPagoService;

    constructor(servicio: SelectorFormasPagoService, 
        alertCtrl: AlertController, 
        loadingCtrl: LoadingController, 
        ) {
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
            async data => {
                if (data.length === 0) {
                    let alert: any = await this.alertCtrl.create({
                        header: 'Error',
                        message: 'Error al cargar las formas de pago',
                        buttons: ['Ok'],
                    });
                    await alert.present();
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
