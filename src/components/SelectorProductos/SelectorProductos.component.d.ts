import { EventEmitter } from "@angular/core";
import { SelectorBase } from "../SelectorBase/SelectorBase";
import { LoadingController, AlertController, NavController } from "ionic-angular";
import { SelectorProductosService } from "./SelectorProductos.service";
import { Keyboard } from '@ionic-native/keyboard';
export declare class SelectorProductosComponent extends SelectorBase {
    private servicio;
    private loadingCtrl;
    private alertCtrl;
    private keyboard;
    private nav;
    seleccionar: EventEmitter<{}>;
    filtroNombre: string;
    filtroFamilia: string;
    filtroSubgrupo: string;
    constructor(servicio: SelectorProductosService, loadingCtrl: LoadingController, alertCtrl: AlertController, keyboard: Keyboard, nav: NavController);
    myIonSearchBar: any;
    ngAfterViewInit(): void;
    setFocus(): void;
    protected cargarDatos(filtro: string): void;
    abrirFichaProducto(producto: any): void;
}
