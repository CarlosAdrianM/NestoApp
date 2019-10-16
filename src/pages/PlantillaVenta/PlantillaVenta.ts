import {NavController, AlertController, LoadingController, Platform, Events, Slides} from 'ionic-angular';
import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {SelectorClientes} from '../../components/SelectorClientes/SelectorClientes';
import {SelectorPlantillaVenta} from '../../components/SelectorPlantillaVenta/SelectorPlantillaVenta';
import {Configuracion} from '../../components/configuracion/configuracion';
import {PlantillaVentaService} from './PlantillaVenta.service';
import {Usuario} from '../../models/Usuario';
import { Parametros } from '../../services/Parametros.service';
import { ProfilePage } from '../../pages/profile/profile';
import { DecimalPipe } from '@angular/common';
import { ClienteComponent } from '../Cliente/Cliente.component';

@Component({
    templateUrl: 'PlantillaVenta.html',
})
export class PlantillaVenta {
    private servicio: PlantillaVentaService;
    private usuario: Usuario;
    private parametros: Parametros;
    private platform: Platform;
    private alertCtrl: AlertController;
    private loadingCtrl: LoadingController;

    constructor(usuario: Usuario, nav: NavController, servicio: PlantillaVentaService, parametros: Parametros, platform: Platform, events: Events, alertCtrl: AlertController, loadingCtrl: LoadingController, private ref: ChangeDetectorRef) {
        this.usuario = usuario;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
        this.parametros = parametros;
        this.platform = platform;
        this.almacen = this.usuario.almacen;
    }

    @ViewChild(Slides) slider: Slides;
    @ViewChild('inputCliente') mySelectorCliente;

    ionViewDidLoad() {
        if (this.usuario != undefined && this.usuario.nombre != undefined) {
            console.log("El usuario es " + this.usuario.nombre);
        } else {
            console.log("El usuario no está cargado");
            this.nav.setRoot(ProfilePage);
        }
    }

    ionViewWillEnter() {
        console.log("Refrescamos...");
        this.ref.detectChanges();
    }

    
    ionViewDidEnter() {
        if (this.slider.getActiveIndex() === 0) {
            setTimeout(() => {
                this.mySelectorCliente.setFocus();
            }, 0);
        } else if (this.slider.getActiveIndex() === 1) {
            setTimeout(() => {
                this._selectorPlantillaVenta.setFocus();
            }, 0);
        }
    }
    


    private nav: NavController;   
    public clienteSeleccionado: any;
    public productosResumen: any[];
    private _direccionSeleccionada: any;
    get direccionSeleccionada(): any {
        return this._direccionSeleccionada;
    }
    set direccionSeleccionada(value: any) {
        this._direccionSeleccionada = value;
        if (value) {
            this.formaPago = value.formaPago;
            this.plazosPago = value.plazosPago;
        }
        if (this._direccionSeleccionada && this._direccionSeleccionada.estado == 5) {
            this.nav.push(ClienteComponent, { 
                empresa: this.clienteSeleccionado.empresa, 
                cliente: this.clienteSeleccionado.cliente,
                contacto: this._direccionSeleccionada.contacto
            })
        }
    }
    private hoy: Date = new Date();
    private hoySinHora: Date = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate(), 0, 0, 0, 0);
    public fechaMinima: string = (this.ajustarFechaEntrega(this.hoySinHora)).toISOString().substring(0,10);
    public fechaEntrega: string = this.fechaMinima;
    private iva: string;
    private formaPago: any;
    private plazosPago: any;
    public esPresupuesto: boolean = false;
    public respuestaGlovo: any;
    public sePuedeServirPorGlovo: boolean = false;
    public direccionFormateada: string;
    public costeGlovo: number;
    public servirPorGlovo: boolean;
    private almacen: any;

    @ViewChild(SelectorPlantillaVenta)
    public _selectorPlantillaVenta: SelectorPlantillaVenta;

    @ViewChild(SelectorClientes)
    public _selectorClientes: SelectorClientes;

    public cargarProductos(cliente: any): void {
        if (!this.clienteSeleccionado) {
            this.cargarProductosPlantilla(cliente);
        } else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
            let alert: any = this.alertCtrl.create({
                title: 'Cambiar cliente',
                message: '¿Desea cambiar de cliente y comenzar el pedido de nuevo?',
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: (): any => {
                            return;
                        },
                    },
                    {
                        text: 'Sí',
                        handler: (): any => {
                            this.cargarProductosPlantilla(cliente);
                        },
                    },
                ],
            });
            alert.present();
        } else if (this.clienteSeleccionado === cliente) {
            this.siguientePantalla();
        }
    }

    private cargarProductosPlantilla(cliente: any[]): void {
        this.slider.lockSwipeToNext(false);
        this.siguientePantalla();
        this.clienteSeleccionado = cliente;
        /*
        setTimeout(() => {
            this._selectorPlantillaVenta.setFocus();
        }, 150);
        */
    }

    public avanzar(slides: any): void {
        console.log(slides.getActiveIndex());
        console.log(slides.getPreviousIndex());
        if (slides.getActiveIndex() === 2 && slides.getPreviousIndex() === 1) {
            console.log("Resumen");
            this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
            this.ref.detectChanges();
        } else if (slides.getActiveIndex() === 4 && slides.getPreviousIndex() === 3) {
            console.log("Finalizar");
            var pedido = this.prepararPedido();
            this.servicio.sePuedeServirPorGlovo(pedido).subscribe(
                data => {
                    this.respuestaGlovo = data;
                    if (this.respuestaGlovo) {
                        console.log(this.respuestaGlovo);
                        this.sePuedeServirPorGlovo = true;
                        this.costeGlovo = this.respuestaGlovo.Coste;
                        this.direccionFormateada= this.respuestaGlovo.DireccionFormateada;
                    } else {
                        this.sePuedeServirPorGlovo = false;
                        this.costeGlovo = 0;
                        this.direccionFormateada = "";
                    }
                },
                error => {
                    let alert = this.alertCtrl.create({
                        title: 'Error',
                        subTitle: 'No se ha podido comprobar si se puede servir por Glovo:\n' + error.ExceptionMessage,
                        buttons: ['Ok'],
                    });
                    alert.present();
                },
                () => {
                }
            );
        } /*else if (slides.getActiveIndex() === 1) {
            setTimeout(() => {
                this._selectorPlantillaVenta.setFocus();
            }, 150);
        }
        */
    }

    public sePuedeAvanzar(): boolean {
        return this.slider && (
            this.slider.getActiveIndex() === 0 && this.clienteSeleccionado ||
            this.slider.getActiveIndex() === 1 ||
            this.slider.getActiveIndex() === 2 && this.productosResumen && this.productosResumen.length > 0 ||
            this.slider.getActiveIndex() === 3);
    }

    public siguientePantalla(): void {
        this.slider.slideNext();
    }

    public seleccionarCliente(cliente: any): void {
        this.direccionSeleccionada = cliente;
        this.iva = cliente.iva;
    }

    private prepararPedido(): any {
        let pedido: any;

        pedido = {
            'empresa': this.clienteSeleccionado.empresa.trim(),
            'cliente': this.clienteSeleccionado.cliente.trim(),
            'contacto': this.direccionSeleccionada.contacto,
            'fecha': this.hoy,
            'formaPago': this.formaPago,
            'plazosPago': this.plazosPago.trim(),
            'primerVencimiento': this.hoy, // se calcula en la API
            'iva': this.direccionSeleccionada.iva,
            'vendedor': this.direccionSeleccionada.vendedor,
            'comentarios': this.direccionSeleccionada.comentarioRuta,
            'comentarioPicking': this.clienteSeleccionado.comentarioPicking ? this.clienteSeleccionado.comentarioPicking.trim() : null,
            'periodoFacturacion': this.direccionSeleccionada.periodoFacturacion,
            'ruta': this.servirPorGlovo ? "GLV" : this.direccionSeleccionada.ruta,
            'serie': 'NV', // calcular
            'ccc': this.formaPago === "RCB" ? this.direccionSeleccionada.ccc : null,
            'origen': this.clienteSeleccionado.empresa.trim(),
            'contactoCobro': this.clienteSeleccionado.contacto.trim(), // calcular
            'noComisiona': this.direccionSeleccionada.noComisiona,
            'mantenerJunto': this.direccionSeleccionada.mantenerJunto,
            'servirJunto': this.direccionSeleccionada.servirJunto,
            'EsPresupuesto': this.esPresupuesto,
            'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
            'LineasPedido': [],
        };

        let nuevaLinea: any = {};
        let lineaPedidoOferta: any = {};
        let ofertaLinea: number = 0;
        let ultimaOferta: number = 0;

        for (let linea of this.productosResumen) {
            ofertaLinea = linea.cantidadOferta ? ++ultimaOferta : 0;
            nuevaLinea = {
                'estado': this.esPresupuesto ? -3 : 1, // ojo, de parámetro. ¿Pongo 0 para tener que validar?
                'tipoLinea': 1, // Producto
                'producto': linea.producto,
                'texto': linea.texto,
                'cantidad': linea.cantidad,
                'fechaEntrega': this.fechaEntrega,
                'precio': linea.precio,
                'descuento': linea.descuento,
                'aplicarDescuento': linea.aplicarDescuento,
                'vistoBueno': 0, // calcular
                'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
                'almacen': this.almacen,
                'iva': linea.iva,
                'delegacion': this.usuario.delegacion,
                'formaVenta': this.usuario.formaVenta,
                'oferta': ofertaLinea === 0 ? null : ofertaLinea,
            };
            pedido.LineasPedido.push(nuevaLinea);

            linea.cantidadOferta = +linea.cantidadOferta;
            if (linea.cantidadOferta) {
                lineaPedidoOferta = Object.assign({}, nuevaLinea);
                lineaPedidoOferta.cantidad = linea.cantidadOferta;
                lineaPedidoOferta.precio = 0;
                lineaPedidoOferta.oferta = nuevaLinea.oferta;
                pedido.LineasPedido.push(lineaPedidoOferta);
            }
        }

        console.log(pedido);
        return pedido;
    }

    public crearPedido(): void {
        let loading: any = this.loadingCtrl.create({
            content: 'Creando Pedido...',
        });

        loading.present();

        this.servicio.crearPedido(this.prepararPedido()).subscribe(
            data => {
                let numeroPedido: string = data.numero;
                let alert = this.alertCtrl.create({
                    title: 'Creado',
                    subTitle: 'Pedido ' + numeroPedido + ' creado correctamente',
                    buttons: ['Ok'],
                });
                alert.present();
                this.reinicializar();
            },
            error => {
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'No se ha podido crear el pedido:\n' + error.ExceptionMessage,
                    buttons: ['Ok'],
                });
                alert.present();
                loading.dismiss();
            },
            () => {
                loading.dismiss();
            }
        );
    }

    public hayAlgunProducto(): boolean {
        return false;
    }

    public reinicializar(): void {
        this.clienteSeleccionado = null;
        this._selectorClientes.resetearFiltros();
        this.productosResumen = null;
        this.direccionSeleccionada = null;
        this.slider.slideTo(0);
        this.slider.lockSwipeToNext(true);
    }
        
    get totalPedido(): number {
        return this.direccionSeleccionada.iva ? this._selectorPlantillaVenta.totalPedido : this._selectorPlantillaVenta.baseImponiblePedido;
    }

    get baseImponiblePedido(): number {
        return this._selectorPlantillaVenta.baseImponiblePedido;
    }

    get baseImponibleParaPortes(): number {
        return this._selectorPlantillaVenta.baseImponibleParaPortes;
    }

    public cambiarIVA(): void {
        this.direccionSeleccionada.iva = this.direccionSeleccionada.iva ? undefined : this.iva;
    }

    private ajustarFechaEntrega(fecha: Date): Date {
        console.log("Ajustar fecha");
        fecha.setHours(fecha.getHours() - fecha.getTimezoneOffset() / 60);
        if (this.hoy.getHours() < 11) {
            return fecha;
        } else {
            let nuevaFecha: Date = fecha;
            nuevaFecha.setDate(nuevaFecha.getDate() + 1); //mañana
            return nuevaFecha;
        }
    }
}
