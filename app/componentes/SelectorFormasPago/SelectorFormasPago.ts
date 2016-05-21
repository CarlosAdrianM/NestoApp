﻿import {Component, Injectable, Input} from '@angular/core';
import {Select, List, Item, Alert, NavController, Loading, Icon, Content, Option} from 'ionic-angular';
import {SelectorFormasPagoService} from './SelectorFormasPago.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-formas-pago',
    templateUrl: 'build/componentes/SelectorFormasPago/SelectorFormasPago.html',
    directives: [Select, Item, Icon, Content, Option],
    providers: [SelectorFormasPagoService],
    inputs: ['cliente', 'seleccionado'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorFormasPago extends SelectorBase {

    @Input() private cliente: any;
    @Input() private seleccionado: any;
    private nav: NavController;
    private servicio: SelectorFormasPagoService;

    constructor(servicio: SelectorFormasPagoService, nav: NavController) {
        super();
        this.nav = nav;
        this.servicio = servicio;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        this.servicio.getFormasPago(this.cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'Error al cargar las formas de pago',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
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