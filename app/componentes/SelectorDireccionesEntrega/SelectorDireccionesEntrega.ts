import {Component, Injectable} from 'angular2/core';
import {Searchbar, List, Item, Alert, NavController, Icon} from 'ionic-angular';
import {SelectorDireccionesEntregaService} from './SelectorDireccionesEntrega.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-direcciones-entrega',
    templateUrl: 'build/componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega.html',
    directives: [Searchbar, List, Item, Icon],
    providers: [SelectorDireccionesEntregaService],
    inputs: ['cliente'],
})

@Injectable()
export class SelectorDireccionesEntrega extends SelectorBase {
    private servicio: SelectorDireccionesEntregaService;
    private nav: NavController;
    private direccionesEntrega: any[];
    private direccionSeleccionada: any;

    // @Input() 
    private cliente: any;

    constructor(servicio: SelectorDireccionesEntregaService, nav: NavController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
    }

    public cargarDatos(cliente: any): void {
        this.servicio.direccionesEntrega(cliente).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'El cliente ' + cliente.cliente + ' no tiene ninguna dirección de entrega',
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    this.direccionesEntrega = data;
                    this.direccionSeleccionada = undefined;
                    let i: number = 0;
                    while (this.direccionSeleccionada === undefined) {
                        if (i + 1 > this.direccionesEntrega.length) {
                            throw 'Error en la API de Nesto: cliente sin dirección por defecto';
                        }
                        if (this.direccionesEntrega[i].esDireccionPorDefecto) {
                            this.direccionSeleccionada = this.direccionesEntrega[i];
                            this.seleccionarDato(this.direccionSeleccionada);
                        }
                        i++;
                    }
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    public seleccionarDireccion(direccion: any): void {
        this.direccionSeleccionada = direccion;
        this.seleccionarDato(direccion);
    }

    public ngOnChanges(): void {
        this.cargarDatos(this.cliente);
    }
}
