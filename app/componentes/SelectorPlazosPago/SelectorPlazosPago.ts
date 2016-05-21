import {Component, Injectable, Input} from '@angular/core';
import {Select, List, Item, Alert, NavController, Loading, Icon, Content, Option} from 'ionic-angular';
import {SelectorPlazosPagoService} from './SelectorPlazosPago.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-plazos-pago',
    templateUrl: 'build/componentes/SelectorPlazosPago/SelectorPlazosPago.html',
    directives: [Select, Item, Icon, Content, Option],
    providers: [SelectorPlazosPagoService],
    inputs: ['seleccionado', 'cliente'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorPlazosPago extends SelectorBase {

    @Input() private seleccionado: any;
    @Input() private cliente: any;
    private nav: NavController;
    private servicio: SelectorPlazosPagoService;

    constructor(servicio: SelectorPlazosPagoService, nav: NavController) {
        super();
        this.nav = nav;
        this.servicio = servicio;
    }

    ngOnInit() {
        this.cargarDatos();
    }

    public cargarDatos(): void {
        /*
        let loading: any = Loading.create({
            content: 'Cargando Plazos de Pago...',
        });

        this.nav.present(loading);
        */
        this.servicio.getPlazosPago(this.cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'Error al cargar los plazos de pago',
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