import {Component, Injectable, Output, EventEmitter, ViewChild} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';
import {SelectorClientesService} from './SelectorClientes.service';
import { SelectorBase } from '../SelectorBase/SelectorBase';
import { Keyboard } from '@ionic-native/keyboard';
import { ClienteComponent } from '../../pages/Cliente/Cliente.component';

@Component({
    selector: 'selector-clientes',
    templateUrl: 'SelectorClientes.html',
    // outputs: ['seleccionar']
})

@Injectable()
export class SelectorClientes extends SelectorBase {
    @Output() seleccionar = new EventEmitter();
    private servicio: SelectorClientesService;
    private loadingCtrl: LoadingController;
    private alertCtrl: AlertController;

    constructor(servicio: SelectorClientesService, loadingCtrl: LoadingController, 
        alertCtrl: AlertController, private keyboard: Keyboard, private nav: NavController) {
        super();
        this.servicio = servicio;
        this.loadingCtrl = loadingCtrl;
        this.alertCtrl = alertCtrl;
    }

    @ViewChild('barra') myIonSearchBar;
    
    ngAfterViewInit()
    {
        this.setFocus();
    }
    

    public setFocus(): void {
        setTimeout(() => {
            this.myIonSearchBar.setFocus();
            this.keyboard.show();
        }, 0);
    }

    public cargarDatos(filtro: string): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Cargando Clientes...',
        });

        loading.present();

        this.servicio.getClientes(filtro).subscribe(
            data => {
                if (data.length === 0) {
                    let alert: any = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No se encuentra ningún cliente que coincida con ' + filtro,
                        buttons: ['Ok'],
                    });
                    alert.present();
                } else {
                    this.inicializarDatos(data);
                }
                loading.dismiss();
            },
            error => {
                // loading.dismiss();
                this.errorMessage = <any>error;
                loading.dismiss();
            },
            () => {
                
            }
        );
    }

    public colorEstado(estado: number): string {
        if (estado == 0 || estado == 9) {
            return "secondary";
        }
        if (estado == 5) {
            return "danger";
        }
        if (estado == 7) {
            return "primary";
        }

        return "default";
    }

    crearContacto(event: Event, cliente: any): void {
        event.stopPropagation();
        this.nav.push(ClienteComponent, { 
            nif: cliente.cifNif,
            nombre: cliente.nombre
        })
    }

    annadirCliente(event: Event): void {
        event.stopPropagation();
        this.nav.push(ClienteComponent);
    }
}
