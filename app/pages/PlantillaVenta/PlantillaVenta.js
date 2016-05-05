"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ionic_angular_1 = require('ionic-angular');
var core_1 = require('angular2/core');
var SelectorClientes_1 = require('../../componentes/SelectorClientes/SelectorClientes');
var SelectorPlantillaVenta_1 = require('../../componentes/SelectorPlantillaVenta/SelectorPlantillaVenta');
var SelectorDireccionesEntrega_1 = require('../../componentes/SelectorDireccionesEntrega/SelectorDireccionesEntrega');
var configuracion_1 = require('../../componentes/configuracion/configuracion');
var PlantillaVenta_service_1 = require('./PlantillaVenta.service');
var Usuario_1 = require('../../models/Usuario');
var Parametros_service_1 = require('../../services/Parametros.service');
var profile_1 = require('../../pages/profile/profile');
var ionic_native_1 = require('ionic-native');
var SelectorFormasPago_1 = require('../../componentes/SelectorFormasPago/SelectorFormasPago');
var SelectorPlazosPago_1 = require('../../componentes/SelectorPlazosPago/SelectorPlazosPago');
var PlantillaVenta = (function () {
    function PlantillaVenta(nav, servicio, usuario, parametros) {
        var _this = this;
        this.fechaEntrega = new Date();
        this.hoy = new Date();
        this.opcionesDatepicker = {
            date: this.fechaEntrega,
            mode: 'date',
        };
        // Esto es para que tenga que haber usuario. Debería ir en la clase usuario, pero no funciona
        if (!usuario.nombre) {
            nav.push(profile_1.ProfilePage);
        }
        this.opcionesSlides = {
            allowSwipeToNext: false,
            paginationHide: false,
            onInit: function (slides) { return _this.slider = slides; },
            onSlideChangeStart: function (slides) { return _this.avanzar(slides); },
        };
        this.nav = nav;
        this.servicio = servicio;
        this.usuario = usuario;
        this.parametros = parametros;
        this.cargarParametros();
    }
    PlantillaVenta.prototype.cargarProductos = function (cliente) {
        var _this = this;
        if (!this.clienteSeleccionado) {
            this.cargarProductosPlantilla(cliente);
        }
        else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
            var alert_1 = ionic_angular_1.Alert.create({
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
            this.nav.present(alert_1);
        }
        else if (this.clienteSeleccionado === cliente) {
            this.slider.slideNext();
        }
    };
    PlantillaVenta.prototype.cargarProductosPlantilla = function (cliente) {
        this.clienteSeleccionado = cliente;
        this.slider.unlockSwipeToNext();
        this.siguientePantalla();
    };
    /*
    public cargarResumen(productosResumen: any[]): void {
        this.productosResumen = productosResumen;
    }
    */
    PlantillaVenta.prototype.avanzar = function (slides) {
        if (slides.activeIndex === 2 && slides.previousIndex === 1) {
            this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
        } /* else if (slides.activeIndex === 3 && slides.previousIndex === 2) {
            
        }*/
    };
    PlantillaVenta.prototype.sePuedeAvanzar = function () {
        return this.slider && (this.slider.activeIndex === 0 && this.clienteSeleccionado ||
            this.slider.activeIndex === 1 ||
            this.slider.activeIndex === 2 && this.productosResumen && this.productosResumen.length > 0 ||
            this.slider.activeIndex === 3);
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
            'formaPago': this.direccionSeleccionada.formaPago,
            'plazosPago': this.direccionSeleccionada.plazosPago.trim(),
            'primerVencimiento': this.hoy,
            'iva': this.direccionSeleccionada.iva,
            'vendedor': this.direccionSeleccionada.vendedor,
            'comentarios': this.direccionSeleccionada.comentarioRuta,
            'comentarioPicking': this.clienteSeleccionado.comentarioPicking ? this.clienteSeleccionado.comentarioPicking.trim() : null,
            'periodoFacturacion': this.direccionSeleccionada.periodoFacturacion,
            'ruta': this.direccionSeleccionada.ruta,
            'serie': 'NV',
            'ccc': this.direccionSeleccionada.ccc,
            'origen': this.clienteSeleccionado.empresa.trim(),
            'contactoCobro': this.clienteSeleccionado.contacto.trim(),
            'noComisiona': this.direccionSeleccionada.noComisiona,
            'mantenerJunto': this.direccionSeleccionada.mantenerJunto,
            'servirJunto': this.direccionSeleccionada.servirJunto,
            'usuario': configuracion_1.Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
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
                'usuario': configuracion_1.Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
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
        return pedido;
    };
    PlantillaVenta.prototype.crearPedido = function () {
        var _this = this;
        var loading = ionic_angular_1.Loading.create({
            content: 'Creando Pedido...',
        });
        this.nav.present(loading);
        this.servicio.crearPedido(this.prepararPedido()).subscribe(function (data) {
            var numeroPedido = data.numero;
            var alert = ionic_angular_1.Alert.create({
                title: 'Creado',
                subTitle: 'Pedido ' + numeroPedido + ' creado correctamente',
                buttons: ['Ok'],
            });
            _this.nav.present(alert);
            _this.reinicializar();
        }, function (error) {
            var alert = ionic_angular_1.Alert.create({
                title: 'Error',
                subTitle: 'No se ha podido crear el pedido',
                buttons: ['Ok'],
            });
            _this.nav.present(alert);
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
        this.slider.lockSwipeToNext();
    };
    PlantillaVenta.prototype.cargarParametros = function () {
        var self = this;
        this.parametros.leer('Vendedor').subscribe(function (data) {
            self.usuario.vendedor = data;
        }, function (error) {
            console.log('No se ha podido cargar el almacén por defecto');
        });
        this.parametros.leer('DelegaciónDefecto').subscribe(function (data) {
            self.usuario.delegacion = data;
        }, function (error) {
            console.log('No se ha podido cargar la delegación por defecto');
        });
        this.parametros.leer('AlmacénRuta').subscribe(function (data) {
            self.usuario.almacen = data;
        }, function (error) {
            console.log('No se ha podido cargar el almacén por defecto');
        });
    };
    PlantillaVenta.prototype.seleccionarFechaEntrega = function () {
        var _this = this;
        ionic_native_1.DatePicker.show({
            date: this.fechaEntrega,
            mode: 'date',
            minDate: new Date()
        }).then(function (date) { return _this.fechaEntrega = date; }, function (err) { return console.log('Error al seleccionar la fecha de entrega'); });
    };
    PlantillaVenta.prototype.totalPedido = function () {
        return this.direccionSeleccionada.iva ? this._selectorPlantillaVenta.totalPedido : this._selectorPlantillaVenta.baseImponiblePedido;
    };
    PlantillaVenta.prototype.cambiarIVA = function () {
        this.direccionSeleccionada.iva = this.direccionSeleccionada.iva ? undefined : this.iva;
    };
    __decorate([
        core_1.ViewChild(SelectorPlantillaVenta_1.SelectorPlantillaVenta), 
        __metadata('design:type', SelectorPlantillaVenta_1.SelectorPlantillaVenta)
    ], PlantillaVenta.prototype, "_selectorPlantillaVenta", void 0);
    __decorate([
        core_1.ViewChild(SelectorClientes_1.SelectorClientes), 
        __metadata('design:type', SelectorClientes_1.SelectorClientes)
    ], PlantillaVenta.prototype, "_selectorClientes", void 0);
    PlantillaVenta = __decorate([
        ionic_angular_1.Page({
            templateUrl: 'build/pages/PlantillaVenta/PlantillaVenta.html',
            directives: [SelectorClientes_1.SelectorClientes, SelectorPlantillaVenta_1.SelectorPlantillaVenta, SelectorDireccionesEntrega_1.SelectorDireccionesEntrega, SelectorFormasPago_1.SelectorFormasPago, SelectorPlazosPago_1.SelectorPlazosPago],
            providers: [PlantillaVenta_service_1.PlantillaVentaService, Parametros_service_1.Parametros],
        }), 
        __metadata('design:paramtypes', [ionic_angular_1.NavController, PlantillaVenta_service_1.PlantillaVentaService, Usuario_1.Usuario, Parametros_service_1.Parametros])
    ], PlantillaVenta);
    return PlantillaVenta;
}());
exports.PlantillaVenta = PlantillaVenta;
