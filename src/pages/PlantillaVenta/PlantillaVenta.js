var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NavController, AlertController, LoadingController, Platform, Events, Slides } from 'ionic-angular';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SelectorClientes } from '../../components/SelectorClientes/SelectorClientes';
import { SelectorPlantillaVenta } from '../../components/SelectorPlantillaVenta/SelectorPlantillaVenta';
import { Configuracion } from '../../components/configuracion/configuracion';
import { PlantillaVentaService } from './PlantillaVenta.service';
import { Usuario } from '../../models/Usuario';
import { Parametros } from '../../services/Parametros.service';
import { ProfilePage } from '../../pages/profile/profile';
var PlantillaVenta = (function () {
    //public opcionesSlides: any;
    function PlantillaVenta(usuario, nav, servicio, parametros, platform, events, alertCtrl, loadingCtrl, ref) {
        this.ref = ref;
        this.hoy = new Date();
        this.hoySinHora = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate(), 0, 0, 0, 0);
        this.fechaMinima = (this.ajustarFechaEntrega(this.hoySinHora)).toISOString().substring(0, 10);
        this.fechaEntrega = this.fechaMinima;
        this.usuario = usuario;
        /*
        this.opcionesSlides = {
            allowSwipeToNext: false,
            paginationHide: false,
            onInit: (slides: any): any => {
                this.slider = slides;
            },
            //onSlideChangeStart: (slides: any): void => this.avanzar(slides),
        };
        */
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.loadingCtrl = loadingCtrl;
        this.servicio = servicio;
        this.parametros = parametros;
        this.platform = platform;
    }
    /*
       ngAfterViewInit() {
         this.slider.freeMode = true;
         this.slider.freeModeSticky = true;
       }
    */
    PlantillaVenta.prototype.ionViewDidLoad = function () {
        if (this.usuario != undefined && this.usuario.nombre != undefined) {
            console.log("El usuario es " + this.usuario.nombre);
        }
        else {
            console.log("El usuario no está cargado");
            this.nav.setRoot(ProfilePage);
        }
    };
    PlantillaVenta.prototype.ionViewWillEnter = function () {
        console.log("Refrescamos...");
        this.ref.detectChanges();
    };
    Object.defineProperty(PlantillaVenta.prototype, "direccionSeleccionada", {
        get: function () {
            return this._direccionSeleccionada;
        },
        set: function (value) {
            this._direccionSeleccionada = value;
            if (value) {
                this.formaPago = value.formaPago;
                this.plazosPago = value.plazosPago;
            }
        },
        enumerable: true,
        configurable: true
    });
    PlantillaVenta.prototype.cargarProductos = function (cliente) {
        var _this = this;
        if (!this.clienteSeleccionado) {
            this.cargarProductosPlantilla(cliente);
        }
        else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
            var alert_1 = this.alertCtrl.create({
                title: 'Cambiar cliente',
                message: '¿Desea cambiar de cliente y comenzar el pedido de nuevo?',
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: function () {
                            return;
                        },
                    },
                    {
                        text: 'Sí',
                        handler: function () {
                            _this.cargarProductosPlantilla(cliente);
                        },
                    },
                ],
            });
            alert_1.present();
        }
        else if (this.clienteSeleccionado === cliente) {
            this.siguientePantalla();
        }
    };
    PlantillaVenta.prototype.cargarProductosPlantilla = function (cliente) {
        this.slider.lockSwipeToNext(false);
        this.siguientePantalla();
        this.clienteSeleccionado = cliente;
    };
    /*
    public cargarResumen(productosResumen: any[]): void {
        this.productosResumen = productosResumen;
    }
    */
    PlantillaVenta.prototype.avanzar = function (slides) {
        console.log(slides.getActiveIndex());
        console.log(slides.getPreviousIndex());
        if (slides.getActiveIndex() === 2 && slides.getPreviousIndex() === 1) {
            console.log("Resumen");
            this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
            this.ref.detectChanges();
        } /* else if (slides.activeIndex === 3 && slides.previousIndex === 2) {
            
        }*/
    };
    PlantillaVenta.prototype.sePuedeAvanzar = function () {
        return this.slider && (this.slider.getActiveIndex() === 0 && this.clienteSeleccionado ||
            this.slider.getActiveIndex() === 1 ||
            this.slider.getActiveIndex() === 2 && this.productosResumen && this.productosResumen.length > 0 ||
            this.slider.getActiveIndex() === 3);
    };
    PlantillaVenta.prototype.siguientePantalla = function () {
        this.slider.slideNext();
    };
    PlantillaVenta.prototype.seleccionarCliente = function (cliente) {
        this.direccionSeleccionada = cliente;
        this.iva = cliente.iva;
    };
    PlantillaVenta.prototype.prepararPedido = function () {
        var pedido;
        pedido = {
            'empresa': this.clienteSeleccionado.empresa.trim(),
            'cliente': this.clienteSeleccionado.cliente.trim(),
            'contacto': this.direccionSeleccionada.contacto,
            'fecha': this.hoy,
            'formaPago': this.formaPago,
            'plazosPago': this.plazosPago.trim(),
            'primerVencimiento': this.hoy,
            'iva': this.direccionSeleccionada.iva,
            'vendedor': this.direccionSeleccionada.vendedor,
            'comentarios': this.direccionSeleccionada.comentarioRuta,
            'comentarioPicking': this.clienteSeleccionado.comentarioPicking ? this.clienteSeleccionado.comentarioPicking.trim() : null,
            'periodoFacturacion': this.direccionSeleccionada.periodoFacturacion,
            'ruta': this.direccionSeleccionada.ruta,
            'serie': 'NV',
            'ccc': this.formaPago === "RCB" ? this.direccionSeleccionada.ccc : null,
            'origen': this.clienteSeleccionado.empresa.trim(),
            'contactoCobro': this.clienteSeleccionado.contacto.trim(),
            'noComisiona': this.direccionSeleccionada.noComisiona,
            'mantenerJunto': this.direccionSeleccionada.mantenerJunto,
            'servirJunto': this.direccionSeleccionada.servirJunto,
            'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
            'LineasPedido': [],
        };
        var nuevaLinea = {};
        var lineaPedidoOferta = {};
        var ofertaLinea = 0;
        var ultimaOferta = 0;
        for (var _i = 0, _a = this.productosResumen; _i < _a.length; _i++) {
            var linea = _a[_i];
            ofertaLinea = linea.cantidadOferta ? ++ultimaOferta : 0;
            nuevaLinea = {
                'estado': 1,
                'tipoLinea': 1,
                'producto': linea.producto,
                'texto': linea.texto,
                'cantidad': linea.cantidad,
                'fechaEntrega': this.fechaEntrega,
                'precio': linea.precio,
                'descuento': linea.descuento,
                'aplicarDescuento': linea.aplicarDescuento,
                'vistoBueno': 0,
                'usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
                'almacen': this.usuario.almacen,
                'iva': linea.iva,
                'delegacion': this.usuario.delegacion,
                'formaVenta': this.usuario.formaVenta,
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
        console.log(pedido);
        return pedido;
    };
    PlantillaVenta.prototype.crearPedido = function () {
        var _this = this;
        var loading = this.loadingCtrl.create({
            content: 'Creando Pedido...',
        });
        loading.present();
        this.servicio.crearPedido(this.prepararPedido()).subscribe(function (data) {
            var numeroPedido = data.numero;
            var alert = _this.alertCtrl.create({
                title: 'Creado',
                subTitle: 'Pedido ' + numeroPedido + ' creado correctamente',
                buttons: ['Ok'],
            });
            alert.present();
            _this.reinicializar();
        }, function (error) {
            var alert = _this.alertCtrl.create({
                title: 'Error',
                subTitle: 'No se ha podido crear el pedido',
                buttons: ['Ok'],
            });
            alert.present();
            loading.dismiss();
        }, function () {
            loading.dismiss();
        });
    };
    PlantillaVenta.prototype.hayAlgunProducto = function () {
        return false;
    };
    PlantillaVenta.prototype.reinicializar = function () {
        this.clienteSeleccionado = null;
        this._selectorClientes.resetearFiltros();
        this.productosResumen = null;
        this.direccionSeleccionada = null;
        this.slider.slideTo(0);
        this.slider.lockSwipeToNext(true);
    };
    Object.defineProperty(PlantillaVenta.prototype, "totalPedido", {
        get: function () {
            return this.direccionSeleccionada.iva ? this._selectorPlantillaVenta.totalPedido : this._selectorPlantillaVenta.baseImponiblePedido;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlantillaVenta.prototype, "baseImponiblePedido", {
        get: function () {
            return this._selectorPlantillaVenta.baseImponiblePedido;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlantillaVenta.prototype, "baseImponibleParaPortes", {
        get: function () {
            return this._selectorPlantillaVenta.baseImponibleParaPortes;
        },
        enumerable: true,
        configurable: true
    });
    PlantillaVenta.prototype.cambiarIVA = function () {
        this.direccionSeleccionada.iva = this.direccionSeleccionada.iva ? undefined : this.iva;
    };
    PlantillaVenta.prototype.ajustarFechaEntrega = function (fecha) {
        console.log("Ajustar fecha");
        fecha.setHours(fecha.getHours() - fecha.getTimezoneOffset() / 60);
        if (this.hoy.getHours() < 11) {
            return fecha;
        }
        else {
            var nuevaFecha = fecha;
            nuevaFecha.setDate(nuevaFecha.getDate() + 1); //mañana
            return nuevaFecha;
        }
    };
    return PlantillaVenta;
}());
__decorate([
    ViewChild(Slides),
    __metadata("design:type", Slides)
], PlantillaVenta.prototype, "slider", void 0);
__decorate([
    ViewChild(SelectorPlantillaVenta),
    __metadata("design:type", SelectorPlantillaVenta)
], PlantillaVenta.prototype, "_selectorPlantillaVenta", void 0);
__decorate([
    ViewChild(SelectorClientes),
    __metadata("design:type", SelectorClientes)
], PlantillaVenta.prototype, "_selectorClientes", void 0);
PlantillaVenta = __decorate([
    Component({
        templateUrl: 'PlantillaVenta.html',
    }),
    __metadata("design:paramtypes", [Usuario, NavController, PlantillaVentaService, Parametros, Platform, Events, AlertController, LoadingController, ChangeDetectorRef])
], PlantillaVenta);
export { PlantillaVenta };
//# sourceMappingURL=PlantillaVenta.js.map