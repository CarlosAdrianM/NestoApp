import {Component, Injectable, Output, EventEmitter} from 'angular2/core';
import {Searchbar, List, Item, Alert, NavController} from 'ionic-angular';
import {SelectorClientesService} from './SelectorClientes.service';

@Component({
    selector: 'selector-clientes',
    templateUrl: 'build/componentes/SelectorClientes/SelectorClientes.html',
    directives: [Searchbar, List, Item],
    providers: [SelectorClientesService],
})

@Injectable()
export class SelectorClientes {
    private searchQuery: string;
    private clientes: any[];
    private errorMessage: string;
    private servicio: SelectorClientesService;
    private nav: NavController;

    @Output() private seleccionar: EventEmitter<any> = new EventEmitter();

    constructor(servicio: SelectorClientesService, nav: NavController) {
        this.searchQuery = '';
        this.servicio = servicio;
        this.nav = nav;
    }

    public getClientes(): void {
        this.servicio.getClientes(this.searchQuery).subscribe(
            data => {
                this.clientes = data;
                if (this.clientes.length === 0) {
                    let alert: Alert = Alert.create({
                        title: 'Error',
                        subTitle: 'No se encuentra ningún cliente que coincida con ' + this.searchQuery,
                        buttons: ['Ok'],
                    });
                    this.nav.present(alert);
                }
            },
            error => this.errorMessage = <any>error
        );
    }

    public seleccionarCliente(cliente: any): void {
        this.seleccionar.emit(cliente);
    }
}
