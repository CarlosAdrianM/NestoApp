import {Component, Injectable, Input} from 'angular2/core';
import {Select, List, Item, Alert, NavController, Loading, Icon, Content, Option} from 'ionic-angular';
import {SelectorFormasPagoService} from './SelectorFormasPago.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-formas-pago',
    templateUrl: 'build/componentes/SelectorFormasPago/SelectorFormasPago.html',
    directives: [Select, Item, Icon, Content, Option],
    providers: [SelectorFormasPagoService],
    inputs: ['seleccionado'],
    outputs: ['seleccionar'],
})

@Injectable()
export class SelectorFormasPago extends SelectorBase {

    @Input() private seleccionado: any;
    private nav: NavController;
    private servicio: SelectorFormasPagoService;

    constructor(servicio: SelectorFormasPagoService, nav: NavController) {
        super();
        this.nav = nav;
        this.servicio = servicio;
        this.cargarDatos();
    }

    public cargarDatos(): void {
        /*
        let loading: any = Loading.create({
            content: 'Cargando Formas de Pago...',
        });

        this.nav.present(loading);
        */
        this.servicio.getFormasPago().subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'Error al cargar las formas de pago',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    for (let forma of data) {
                        forma.numero = forma.Número;
                        forma.descripcion = forma.Descripción;
                    }
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