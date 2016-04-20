import {Page, NavController, Alert, Loading} from 'ionic-angular';
import {ViewChild} from 'angular2/core';
import {SelectorClientes} from '../../componentes/SelectorClientes/SelectorClientes';
import {SelectorPlantillaVenta} from '../../componentes/SelectorPlantillaVenta/SelectorPlantillaVenta';
import {SelectorDireccionesEntrega} from '../../componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega';
import {Configuracion} from '../../componentes/configuracion/configuracion';
import {PlantillaVentaService} from './PlantillaVenta.service';

@Page({
    templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
    directives: [SelectorClientes, SelectorPlantillaVenta, SelectorDireccionesEntrega],
    providers: [PlantillaVentaService],
})
export class PlantillaVenta {
    private servicio: PlantillaVentaService;

    constructor(nav: NavController, servicio: PlantillaVentaService) {
        this.opcionesSlides = {
            allowSwipeToNext: false,
            paginationHide: false,
            onInit: (slides: any): any => this.slider = slides,
            onSlideChangeStart: (slides: any): void => this.avanzar(slides),
        };
        this.nav = nav;
        this.servicio = servicio;
    }

    private nav: NavController;
    public opcionesSlides: any;
    public slider: any;
    public clienteSeleccionado: any;
    private productosResumen: any[];
    public direccionSeleccionada: any;
    public fechaEntrega: Date = new Date();
    private hoy: Date = new Date();

    @ViewChild(SelectorPlantillaVenta)
    private _selectorPlantillaVenta: SelectorPlantillaVenta;

    public cargarProductos(cliente: any): void {
        if (!this.clienteSeleccionado) {
            this.cargarProductosPlantilla(cliente);
        } else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
            let alert: any = Alert.create({
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
            this.nav.present(alert);
        } else if (this.clienteSeleccionado === cliente) {
            this.slider.slideNext();
        }
    }

    private cargarProductosPlantilla(cliente: any[]): void {
        this.clienteSeleccionado = cliente;
        this.slider.unlockSwipeToNext();
        this.siguientePantalla();
    }

    /*
    public cargarResumen(productosResumen: any[]): void {
        this.productosResumen = productosResumen;
    }
    */
    public avanzar(slides: any): void {
        if (slides.activeIndex === 2 && slides.previousIndex === 1) {
            this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
        }/* else if (slides.activeIndex === 3 && slides.previousIndex === 2) {
            
        }*/
    }

    public sePuedeAvanzar(): boolean {
        return this.slider && (
            this.slider.activeIndex === 0 && this.clienteSeleccionado ||
            this.slider.activeIndex === 1 ||
            this.slider.activeIndex === 2 && this.productosResumen && this.productosResumen.length > 0);
    }

    public siguientePantalla(): void {
        this.slider.slideNext();
    }

    public seleccionarCliente(cliente: any): void {
        this.direccionSeleccionada = cliente;
    }

    private prepararPedido(): any {
        let usuario: any = Configuracion.usuarioPruebas; // ESTO HAY QUE BORRARLO!!!!!!!
        let pedido: any;

        pedido = {
            'empresa': this.clienteSeleccionado.empresa.trim(),
            'cliente': this.clienteSeleccionado.cliente.trim(),
            'contacto': this.direccionSeleccionada.contacto,
            'fecha': this.hoy,
            'formaPago': this.direccionSeleccionada.formaPago,
            'plazosPago': this.direccionSeleccionada.plazosPago.trim(),
            'primerVencimiento': this.hoy, // se calcula en la API
            'iva': this.clienteSeleccionado.iva,
            'vendedor': this.direccionSeleccionada.vendedor,
            'comentarios': this.direccionSeleccionada.comentarioRuta,
            'comentarioPicking': this.clienteSeleccionado.comentarioPicking ? this.clienteSeleccionado.comentarioPicking.trim() : null,
            'periodoFacturacion': this.direccionSeleccionada.periodoFacturacion,
            'ruta': this.direccionSeleccionada.ruta,
            'serie': 'NV', // calcular
            'ccc': this.direccionSeleccionada.ccc,
            'origen': this.clienteSeleccionado.empresa.trim(),
            'contactoCobro': this.clienteSeleccionado.contacto.trim(), // calcular
            'noComisiona': this.direccionSeleccionada.noComisiona,
            'mantenerJunto': this.direccionSeleccionada.mantenerJunto,
            'servirJunto': this.direccionSeleccionada.servirJunto,
            'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + usuario.nombre,
            'LineasPedido': [],
        };

        let nuevaLinea: any = {};
        let lineaPedidoOferta: any = {};
        let ofertaLinea: number = 0;
        let ultimaOferta: number = 0;

        for (let linea of this.productosResumen) {
            ofertaLinea = linea.cantidadOferta ? ++ultimaOferta : 0;
            nuevaLinea = {
                'estado': 1, // ojo, de parámetro. ¿Pongo 0 para tener que validar?
                'tipoLinea': 1, // Producto
                'producto': linea.producto,
                'texto': linea.texto,
                'cantidad': linea.cantidad,
                'fechaEntrega': this.fechaEntrega,
                'precio': linea.precio,
                'descuento': linea.descuento,
                'aplicarDescuento': linea.aplicarDescuento,
                'vistoBueno': 0, // calcular
                'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + usuario.nombre,
                'almacen': usuario.almacen,
                'iva': linea.iva,
                'delegacion': usuario.delegacion,
                'formaVenta': usuario.formaVenta,
                'oferta': ofertaLinea === 0 ? null : ofertaLinea,
            };
            pedido.LineasPedido.push(nuevaLinea);

            if (linea.cantidadOferta) {
                lineaPedidoOferta = Object.assign({}, nuevaLinea);
                lineaPedidoOferta.cantidad = linea.cantidadOferta;
                lineaPedidoOferta.precio = 0;
                lineaPedidoOferta.oferta = nuevaLinea.oferta;
                pedido.LineasPedido.push(lineaPedidoOferta);
            }
        }

        return pedido;
    }

    public crearPedido(): void {
        let loading: any = Loading.create({
            content: 'Creando Pedido...',
        });

        this.nav.present(loading);

        this.servicio.crearPedido(this.prepararPedido()).subscribe(
            data => {
                let numeroPedido: string = data.numero;
                let alert: Alert = Alert.create({
                    title: 'Creado',
                    subTitle: 'Pedido ' + numeroPedido + ' creado correctamente',
                    buttons: ['Ok'],
                });
                this.nav.present(alert);
                this.nav.pop();
            },
            error => {
                let alert: Alert = Alert.create({
                    title: 'Error',
                    subTitle: 'No se ha podido crear el pedido',
                    buttons: ['Ok'],
                });
                this.nav.present(alert);
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
}
