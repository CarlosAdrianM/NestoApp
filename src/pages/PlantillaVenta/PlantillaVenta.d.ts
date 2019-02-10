import { NavController, AlertController, LoadingController, Platform, Events, Slides } from 'ionic-angular';
import { ChangeDetectorRef } from '@angular/core';
import { SelectorClientes } from '../../components/SelectorClientes/SelectorClientes';
import { SelectorPlantillaVenta } from '../../components/SelectorPlantillaVenta/SelectorPlantillaVenta';
import { PlantillaVentaService } from './PlantillaVenta.service';
import { Usuario } from '../../models/Usuario';
import { Parametros } from '../../services/Parametros.service';
export declare class PlantillaVenta {
    private ref;
    private servicio;
    private usuario;
    private parametros;
    private platform;
    private alertCtrl;
    private loadingCtrl;
    constructor(usuario: Usuario, nav: NavController, servicio: PlantillaVentaService, parametros: Parametros, platform: Platform, events: Events, alertCtrl: AlertController, loadingCtrl: LoadingController, ref: ChangeDetectorRef);
    slider: Slides;
    mySelectorCliente: any;
    ionViewDidLoad(): void;
    ionViewWillEnter(): void;
    ionViewDidEnter(): void;
    private nav;
    clienteSeleccionado: any;
    productosResumen: any[];
    private _direccionSeleccionada;
    direccionSeleccionada: any;
    private hoy;
    private hoySinHora;
    fechaMinima: string;
    fechaEntrega: string;
    private iva;
    private formaPago;
    private plazosPago;
    esPresupuesto: boolean;
    _selectorPlantillaVenta: SelectorPlantillaVenta;
    _selectorClientes: SelectorClientes;
    cargarProductos(cliente: any): void;
    private cargarProductosPlantilla;
    avanzar(slides: any): void;
    sePuedeAvanzar(): boolean;
    siguientePantalla(): void;
    seleccionarCliente(cliente: any): void;
    private prepararPedido;
    crearPedido(): void;
    hayAlgunProducto(): boolean;
    reinicializar(): void;
    readonly totalPedido: number;
    readonly baseImponiblePedido: number;
    readonly baseImponibleParaPortes: number;
    cambiarIVA(): void;
    private ajustarFechaEntrega;
}