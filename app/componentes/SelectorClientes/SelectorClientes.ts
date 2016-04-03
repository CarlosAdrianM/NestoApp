import {Component, Injectable} from 'angular2/core';
import {Searchbar, List, Item, Alert, NavController} from 'ionic-angular';
import {SelectorClientesService} from './SelectorClientes.service';
import {SelectorBase} from '../SelectorBase/SelectorBase';

@Component({
    selector: 'selector-clientes',
    templateUrl: 'build/componentes/SelectorClientes/SelectorClientes.html',
    directives: [Searchbar, List, Item],
    providers: [SelectorClientesService],
})

@Injectable()
export class SelectorClientes extends SelectorBase {
    private errorMessage: string;
    private servicio: SelectorClientesService;
    private nav: NavController;

    constructor(servicio: SelectorClientesService, nav: NavController) {
        super();
        this.servicio = servicio;
        this.nav = nav;
    }

    public cargarDatos(filtro: string): void {
        this.servicio.getClientes(filtro).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'No se encuentra ningún cliente que coincida con ' + filtro,
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                } else {
                    this.inicializarDatos(data);
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    public seleccionarCliente(cliente: any): void {
        this.seleccionar.emit(cliente);
    }
}
