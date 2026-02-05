import { ChangeDetectorRef, Component, ViewChild, OnInit } from '@angular/core';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { AlertController, LoadingController, NavController, IonSlides, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { Events } from 'src/app/services/events.service';
import { IDeactivatableComponent } from 'src/app/utils/ideactivatable-component';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { PedidoVentaComponent } from '../pedido-venta/pedido-venta.component';
import { SelectorClientesComponent } from '../selector-clientes/selector-clientes.component';
import { SelectorPlantillaVentaComponent } from '../selector-plantilla-venta/selector-plantilla-venta.component';
import { PlantillaVentaService } from './plantilla-venta.service';
import { SelectorFormasPagoComponent } from '../selector-formas-pago/selector-formas-pago.component';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ApiErrorCode, ProcessedApiError } from 'src/app/models/api-error.model';
import { RegaloSeleccionado } from '../selector-regalos/selector-regalos.component';

@Component({
  selector: 'app-plantilla-venta',
  templateUrl: './plantilla-venta.component.html',
  styleUrls: ['./plantilla-venta.component.scss'],
})
export class PlantillaVentaComponent implements IDeactivatableComponent, OnInit  {
  private ultimoClienteAbierto: string = "";

  constructor(
    private usuario: Usuario,
    private servicio: PlantillaVentaService,
    events: Events,
    private nav: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private ref: ChangeDetectorRef,
    private platform: Platform,
    private firebaseAnalytics: FirebaseAnalytics,
    private errorHandler: ErrorHandlerService
    ) {
      this.almacen = this.usuario.almacen;
      events.subscribe('clienteModificado', (clienteModificado: any) => {
          this.clienteSeleccionado = clienteModificado;
          this.cargarProductos(clienteModificado);
      });
      events.subscribe('carritoModificado', () => {
          this.slider.getActiveIndex().then(i => {
              if (i === this.indexSlideResumen) { //resumen
                this._selectorPlantillaVenta.cargarResumen();
              }
          });
      });
      this.platform.backButton.subscribeWithPriority(10, () => {
        console.log('Botón atrás pulsado');
      });
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.comprobarCanDeactivate) {
        return true;
    }
    const areUnsavedChanges = this._selectorPlantillaVenta && this._selectorPlantillaVenta.hayAlgunProducto();

    let canDeactivate = true;

    if (areUnsavedChanges && this.comprobarCanDeactivate) {
      canDeactivate = window.confirm('El pedido tiene productos.\n¿Seguro que quiere salir?');
      this.firebaseAnalytics.logEvent("plantilla_venta_desea_salir", {respuesta: canDeactivate});
    }

    this.comprobarCanDeactivate = false;

    return canDeactivate;
  }

  @ViewChild ('slider') slider: IonSlides;
  @ViewChild('inputCliente') mySelectorCliente;

  public async ngOnInit() {
    /*
    this.fechaMinima = (await this.ajustarFechaEntrega(this.hoySinHora)).toISOString().substring(0, 10);
    this.fechaEntrega = this.fechaMinima;
    */
   await this.calcularFechaMinima();
  }
  

  ionViewDidLoad() {
      if (this.usuario != undefined && this.usuario.nombre != undefined) {
          console.log("El usuario es " + this.usuario.nombre);
      } else {
          console.log("El usuario no está cargado");
          this.nav.pop();
      }
  }

  ionViewWillEnter() {
      console.log("Refrescamos...");
      this.ref.detectChanges();
  }

  
  ionViewDidEnter() {
    this.slider.getActiveIndex().then((val) => {
      if (val === 0) {
          this.slider.lockSwipeToNext(true);
          setTimeout(() => {
              this.mySelectorCliente.setFocus();
          }, 0);
      } else if (val === 1) {
          setTimeout(() => {
              this._selectorPlantillaVenta.setFocus();
          }, 0);
      }
    })
  }
    
  private _clienteSeleccionado: any;
  get clienteSeleccionado(): any {
      return this._clienteSeleccionado;
  }
  set clienteSeleccionado(value: any) {
      if (value && !value.cifNif) {
          if (this.ultimoClienteAbierto == value.cliente) {
              this.mostrarAlertaRellenar(value);
          } else {
              this.ultimoClienteAbierto = value.cliente;
              this.nav.navigateForward('cliente', {queryParams: { 
                  empresa: value.empresa, 
                  cliente: value.cliente,
                  contacto: value.contacto
              }})    
          }
      } else {
          this._clienteSeleccionado = value;
      }
  }
  private _pedidoPendienteSeleccionado: number;
  get pedidoPendienteSeleccionado(): number {
      return this._pedidoPendienteSeleccionado;
  }
  set pedidoPendienteSeleccionado(value: number){
      if (value) {
          this.textoBotonCrearPedido = "Ampliar en el Pedido " + value.toString();
      } else {
          this.textoBotonCrearPedido = "Crear Pedido"
      }
      this._pedidoPendienteSeleccionado = value;
  }
  public productosResumen: any[];
  
  private async mostrarAlertaRellenar(value: any) {
    let alert = await this.alertCtrl.create({
      header: 'Faltan datos',
      message: 'A este cliente le faltan datos. Si continuas es ' +
        'posible que no puedas finalizar el pedido. Elige entre rellenar los ' +
        'datos que faltan o continuar con el pedido.',
      buttons: [
        {
          text: 'Rellenar',
          role: 'cancel',
          handler: () => {
            this.firebaseAnalytics.logEvent("plantilla_venta_rellenar_cliente", {cliente: value.cliente, contacto: value.contacto});
            this.nav.navigateForward('cliente', {
              queryParams: {
                empresa: value.empresa,
                cliente: value.cliente,
                contacto: value.contacto
              }
            });
          }
        },
        {
          text: 'Continuar',
          handler: () => {
            this._clienteSeleccionado = value;
            this.cargarProductos(this.clienteSeleccionado);
          }
        }
      ]
    });
    await alert.present();
  }
  
  private _almacen: any;
  get almacen(): any {
    return this._almacen;
  }
  set almacen(value: any){
    if (this._almacen != value){
        this._almacen = value;
        this.calcularFechaMinima();
    }
  }  

  private _direccionSeleccionada: any;
  get direccionSeleccionada(): any {
      return this._direccionSeleccionada;
  }
  set direccionSeleccionada(value: any) {
      this._direccionSeleccionada = value;
      if (value) {
          this.formaPago = value.formaPago;
          this.plazosPago = value.plazosPago;
          this.cargarCorreoYMovilTarjeta();
          this.calcularFechaMinima();
      }
  }
  get textoFacturacionElectronica(): string {
      if (!this.direccionSeleccionada) {
              return ""
      }
      if (this.direccionSeleccionada.tieneFacturacionElectronica) {
          return "Este contacto tiene la facturación electrónica activada"
      }
      if (this.direccionSeleccionada.tieneCorreoElectronico) {
          return "Este contacto tiene correo electrónico, pero NO tiene la facturación electrónica activada"
      }
      return "Recuerde pedir un correo electrónico al cliente para poder activar la facturación electrónica"
  }
  private hoy: Date = new Date();
  private hoySinHora: Date = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate(), 0, 0, 0, 0);
  public fechaMinima;
  public fechaEntrega;
  private iva: string;
  public formaPago: any;
  public plazosPago: any;
  public esPresupuesto: boolean = false;
  public respuestaGlovo: any;
  public sePuedeServirPorGlovo: boolean = false;
  public sePodriaServirConGlovoEnPrepago: boolean = false;
  public direccionFormateada: string;
  public costeGlovo: number;
  public servirPorGlovo: boolean;
  public indexActivo: number;
  public comprobarCanDeactivate: boolean = false;
  public textoBotonCrearPedido: string = "Crear Pedido";
  public listaPedidosPendientes: any;
  public totalPedidoPlazosPago: number;
  public almacenEntregaUrgente: string;

  // Ganavisiones / Regalos
  public regalosSeleccionados: RegaloSeleccionado[] = [];
  private readonly GRUPOS_BONIFICABLES = ['COS', 'ACC', 'PEL'];
  private productosBonificablesCount: number = -1; // -1 = no verificado aún

  get baseImponibleBonificable(): number {
    if (!this.productosResumen) return 0;
    return this.productosResumen
      .filter(p => p.grupo && this.GRUPOS_BONIFICABLES.includes(p.grupo.trim().toUpperCase()))
      .reduce((sum, p) => sum + (p.cantidad * p.precio * (1 - p.descuento)), 0);
  }

  get ganavisionesDisponibles(): number {
    return Math.floor(this.baseImponibleBonificable / 10);
  }

  get ganavisionesUsadosPorRegalos(): number {
    return this.regalosSeleccionados.reduce((sum, r) => sum + (r.producto.Ganavisiones * r.cantidad), 0);
  }

  get hayGanavisionesDisponibles(): boolean {
    // Mostrar slide si:
    // 1. Hay ganavisiones disponibles Y hay productos bonificables, O
    // 2. Hay regalos ya seleccionados (para que el usuario pueda verlos/quitarlos)
    const hayPuntos = this.ganavisionesDisponibles > 0;
    const hayProductos = this.productosBonificablesCount > 0;
    const hayRegalosSeleccionados = this.regalosSeleccionados.length > 0;

    return (hayPuntos && hayProductos) || hayRegalosSeleccionados;
  }

  public onProductosBonificablesCargados(count: number): void {
    this.productosBonificablesCount = count;
    // Forzar actualización del slider por si cambia la visibilidad
    if (this.slider) {
      setTimeout(() => this.slider.update(), 100);
    }
  }

  // Offset para calcular índices de slides después de regalos
  // Si la slide de regalos está visible, las slides posteriores se desplazan +1
  get offsetRegalos(): number {
    return (this.hayGanavisionesDisponibles && this.productosResumen) ? 1 : 0;
  }

  private async validarRegalosSeleccionados(): Promise<void> {
    if (this.regalosSeleccionados.length === 0) return;

    const ganavisionesUsados = this.ganavisionesUsadosPorRegalos;
    const ganavisionesDisponibles = this.ganavisionesDisponibles;

    if (ganavisionesUsados > ganavisionesDisponibles) {
      // Los regalos seleccionados exceden los disponibles, limpiar selección
      this.regalosSeleccionados = [];

      const mensaje = ganavisionesDisponibles === 0
        ? 'Ya no tienes Ganavisiones disponibles. Se han eliminado los regalos seleccionados.'
        : `Solo tienes ${ganavisionesDisponibles} Ganavisiones disponibles, pero habías seleccionado regalos por ${ganavisionesUsados}. Se ha limpiado la selección.`;

      const alert = await this.alertCtrl.create({
        header: 'Regalos actualizados',
        message: mensaje,
        buttons: ['Ok']
      });
      await alert.present();
    }
  }

  private async verificarProductosBonificables(): Promise<void> {
    // Si no hay puntos de ganavisiones, no hace falta verificar productos
    if (this.ganavisionesDisponibles === 0) {
      this.productosBonificablesCount = 0;
      return;
    }

    // Llamar a la API para verificar si hay productos bonificables
    return new Promise((resolve) => {
      this.servicio.cargarProductosBonificables(
        this.clienteSeleccionado.empresa,
        this.baseImponibleBonificable,
        this.almacen,
        this.servirJuntoParaRegalos,
        this.clienteSeleccionado.cliente
      ).subscribe(
        (response) => {
          this.productosBonificablesCount = response.Productos.length;
          resolve();
        },
        (error) => {
          console.error('Error verificando productos bonificables:', error);
          this.productosBonificablesCount = 0;
          resolve();
        }
      );
    });
  }

  // Índices de slides (considerando que regalos es condicional)
  get indexSlideResumen(): number { return 2; }
  get indexSlideRegalos(): number { return 3; } // Solo existe si hayGanavisionesDisponibles
  get indexSlideDireccion(): number { return 3 + this.offsetRegalos; }
  get indexSlidePago(): number { return 4 + this.offsetRegalos; }

  // Getter para usar en template (el operador ?? no está soportado en templates Angular)
  get servirJuntoParaRegalos(): boolean {
    return this.direccionSeleccionada ? this.direccionSeleccionada.servirJunto : true;
  }

  public actualizarRegalos(regalos: RegaloSeleccionado[]): void {
    this.regalosSeleccionados = regalos;
  }

  public async onRegalosInvalidados(productosIds: string[]): Promise<void> {
    if (productosIds.length === 0) return;

    // Buscar los nombres de los productos invalidados en la selección anterior
    const nombresProductos = this.regalosSeleccionados
      .filter(r => productosIds.includes(r.producto.ProductoId))
      .map(r => r.producto.ProductoNombre);

    // Limpiar los regalos invalidados del array
    this.regalosSeleccionados = this.regalosSeleccionados
      .filter(r => !productosIds.includes(r.producto.ProductoId));

    const mensaje = nombresProductos.length > 0
      ? `Se han eliminado los siguientes regalos porque ya no están disponibles con la configuración actual:\n\n${nombresProductos.join('\n')}`
      : `Se han eliminado ${productosIds.length} regalo(s) porque ya no están disponibles.`;

    const alert = await this.alertCtrl.create({
      header: 'Regalos actualizados',
      message: mensaje,
      buttons: ['Ok']
    });
    await alert.present();
  }

  @ViewChild(SelectorPlantillaVentaComponent)
  public _selectorPlantillaVenta: SelectorPlantillaVentaComponent;

  @ViewChild(SelectorClientesComponent)
  public _selectorClientes: SelectorClientesComponent;

  public async cargarProductos(cliente: any): Promise<void> {
      if (!this.clienteSeleccionado) {
          this.cargarProductosPlantilla(cliente);
      } else if (this.clienteSeleccionado && this.clienteSeleccionado !== cliente) {
          let alert: any = await this.alertCtrl.create({
              header: 'Cambiar cliente',
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
          await alert.present();
      } else if (this.clienteSeleccionado === cliente) {
          this.siguientePantalla();
      }
  }

  private cargarProductosPlantilla(cliente: any): void {
      this.clienteSeleccionado = cliente;
      if (!cliente.cifNif) {
          return;
      }
      this.slider.lockSwipeToNext(false);
      this.siguientePantalla();
  }

  public async haAvanzado() {
    this.indexActivo = await this.slider.getActiveIndex();
  }

  public async avanzar(): Promise<void> {
    this.indexActivo = await this.slider.getActiveIndex();
    let indexPrevio = await this.slider.getPreviousIndex();
    if (this.indexActivo === 2 && indexPrevio === 1) {
        console.log("Resumen");
        this.productosResumen = this._selectorPlantillaVenta.cargarResumen();
        this.servicio.cargarListaPendientes(this.clienteSeleccionado.empresa, this.clienteSeleccionado.cliente).subscribe(
            data => {
                this.listaPedidosPendientes = data;
            },
            async error => {
                let alert = await this.alertCtrl.create({
                    header: 'Error',
                    message: 'No se ha podido comprobar si el cliente tiene pedidos pendientes:\n' + error.ExceptionMessage,
                    buttons: ['Ok'],
                });
                await alert.present();
            }
        ),
        () => {
        }
        this.ref.detectChanges();
        if (this.totalPedidoPlazosPago != this.totalPedido)
        {
            this.totalPedidoPlazosPago = this.totalPedido;
        }

        // Validar que los regalos seleccionados no excedan los Ganavisiones disponibles
        await this.validarRegalosSeleccionados();

        // Verificar si hay productos bonificables disponibles (antes de mostrar el slide)
        await this.verificarProductosBonificables();

        // Actualizar slider para que reconozca la slide de regalos si aplica
        console.log("baseImponibleBonificable:", this.baseImponibleBonificable, "hayGanavisiones:", this.hayGanavisionesDisponibles, "productosBonificablesCount:", this.productosBonificablesCount);
        if (this.hayGanavisionesDisponibles) {
            setTimeout(() => {
                this.slider.update();
            }, 100);
        }
    } else if (this.indexActivo === this.indexSlidePago && indexPrevio === this.indexSlideDireccion) {
        console.log("Finalizar");
        this.comprobarSiSePuedeServirPorGlovo();
    }
  }
  
  private comprobarSiSePuedeServirPorGlovo(){
    var pedido = this.prepararPedido();
    this.servicio.sePuedeServirPorGlovo(pedido).subscribe(
        data => {
            this.respuestaGlovo = data;
            if (this.respuestaGlovo) {
                console.log(this.respuestaGlovo);
                this.sePuedeServirPorGlovo = this.respuestaGlovo.condicionesPagoValidas;
                this.sePodriaServirConGlovoEnPrepago = true;
                this.costeGlovo = this.respuestaGlovo.coste;
                this.direccionFormateada= this.respuestaGlovo.direccionFormateada;
                this.almacenEntregaUrgente = this.respuestaGlovo.almacen;
            } else {
                this.sePuedeServirPorGlovo = false;
                this.sePodriaServirConGlovoEnPrepago = false;
                this.costeGlovo = 0;
                this.direccionFormateada = "";
                this.almacenEntregaUrgente = "";
            }
        },
        async error => {
            let alert = await this.alertCtrl.create({
                header: 'Error',
                message: 'No se ha podido comprobar si se puede servir por Glovo:\n' + error.ExceptionMessage,
                buttons: ['Ok'],
            });
            await alert.present();
        },
        () => {
        }
    );
  }

  public sePuedeAvanzar(): boolean {
    if (!this.slider || this.indexActivo === undefined) {
        return false;
    }

    // Slide 0: Cliente
    if (this.indexActivo === 0) {
      return !!this.clienteSeleccionado;
    }
    // Slide 1: Productos
    if (this.indexActivo === 1) {
      return this._selectorPlantillaVenta.hayAlgunProducto();
    }
    // Slide 2: Resumen
    if (this.indexActivo === this.indexSlideResumen) {
      return this.productosResumen && this.productosResumen.length > 0;
    }
    // Slide 3: Regalos (si existe)
    if (this.hayGanavisionesDisponibles && this.indexActivo === this.indexSlideRegalos) {
      return true; // Siempre se puede avanzar desde regalos (son opcionales)
    }
    // Slide Dirección
    if (this.indexActivo === this.indexSlideDireccion) {
      return !!this.direccionSeleccionada;
    }

    return false;
  }

  public anteriorPantalla(): void {
    this.slider.slidePrev();
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
          'Usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
          'Lineas': [],
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
              'Cantidad': linea.cantidad,
              'fechaEntrega': this.fechaEntrega,
              'PrecioUnitario': linea.precio,
              'DescuentoLinea': linea.descuento,
              'AplicarDescuento': linea.aplicarDescuento,
              'vistoBueno': 0, // calcular
              'Usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              'almacen': this.servirPorGlovo ? this.almacenEntregaUrgente : this.almacen,
              'iva': linea.iva,
              'delegacion': this.usuario.delegacion,
              'formaVenta': this.usuario.formaVenta,
              'oferta': ofertaLinea === 0 ? null : ofertaLinea,
          };
          pedido.Lineas.push(nuevaLinea);

          linea.cantidadOferta = +linea.cantidadOferta;
          if (linea.cantidadOferta) {
              lineaPedidoOferta = Object.assign({}, nuevaLinea);
              lineaPedidoOferta.Cantidad = linea.cantidadOferta;
              lineaPedidoOferta.PrecioUnitario = 0;
              lineaPedidoOferta.oferta = nuevaLinea.oferta;
              pedido.Lineas.push(lineaPedidoOferta);
          }
      }

      // Añadir líneas de regalos (Ganavisiones)
      for (let regalo of this.regalosSeleccionados) {
          let textoRegalo = regalo.producto.ProductoNombre;
          if (textoRegalo.length > 40) {
              textoRegalo = textoRegalo.substring(0, 40);
          }
          textoRegalo += ' (BONIF)';

          const lineaRegalo = {
              'estado': this.esPresupuesto ? -3 : 1,
              'tipoLinea': 1,
              'producto': regalo.producto.ProductoId,
              'texto': textoRegalo,
              'Cantidad': regalo.cantidad,
              'fechaEntrega': this.fechaEntrega,
              'PrecioUnitario': regalo.producto.PVP,
              'DescuentoLinea': 1, // 100% descuento
              'AplicarDescuento': false,
              'vistoBueno': 0,
              'Usuario': Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              'almacen': this.servirPorGlovo ? this.almacenEntregaUrgente : this.almacen,
              'iva': this.direccionSeleccionada.iva,
              'delegacion': this.usuario.delegacion,
              'formaVenta': this.usuario.formaVenta,
              'oferta': null,
          };
          pedido.Lineas.push(lineaRegalo);
      }

      console.log(pedido);
      return pedido;
  }

  public async crearPedido(): Promise<void> {
      let numeroPedido: string;

      if (!this.pedidoPendienteSeleccionado) {
        let loading: any = await this.loadingCtrl.create({
            message: 'Creando Pedido...',
        });  
        await loading.present();
        this.servicio.crearPedido(this.prepararPedido()).subscribe(
            async data => {
                this.firebaseAnalytics.logEvent("plantilla_venta_crear_pedido", {pedido: data.numero});
                numeroPedido = data.numero;
                if (this.esTarjetaPrepago() && this.mandarCobroTarjeta) {
                  this.servicio.mandarCobroTarjeta(this.cobroTarjetaCorreo, this.cobroTarjetaMovil, this.redondea(this.totalPedido), numeroPedido, this.clienteSeleccionado.cliente.trim()).subscribe(
                      d => {
                          this.firebaseAnalytics.logEvent("plantilla_venta_mandar_cobro_tarjeta", {pedido: data.numero});
                      },
                      e => {
                          console.log(e);
                      }
                  )
                }
                let alert = await this.alertCtrl.create({
                    header: 'Creado',
                    message: 'Pedido ' + numeroPedido + ' creado correctamente',
                    buttons: ['Ok'],
                });
                await alert.present();
                this.reinicializar();
            },
            async error => {
                await loading.dismiss();
                await this.manejarErrorCreacionPedido(error, false);
            },
            async () => {
                await loading.dismiss();
            }
        );
      } else {
        let loading: any = await this.loadingCtrl.create({
            message: 'Ampliando Pedido...',
        });  
        await loading.present();
        this.servicio.unirPedidos(this.clienteSeleccionado.empresa, this.pedidoPendienteSeleccionado, this.prepararPedido()).subscribe(
            async data => {
                this.firebaseAnalytics.logEvent("plantilla_venta_ampliar_pedido", {pedido: data.numero});
                numeroPedido = data.numero;
                let alert = await this.alertCtrl.create({
                    header: 'Ampliado',
                    message: 'Pedido ' + numeroPedido + ' ampliado correctamente',
                    buttons: ['Ok'],
                });
                await alert.present();
                this.reinicializar();
            },
            async error => {
                const mensaje = this.errorHandler.extractErrorMessage(error);
                let alert = await this.alertCtrl.create({
                    header: 'Error',
                    subHeader: 'No se ha podido ampliar el pedido',
                    message: mensaje,
                    buttons: ['Ok'],
                });
                await alert.present();
                await loading.dismiss();
            },
            async () => {
                await loading.dismiss();
            }
        );
      }
  }

  public hayAlgunProducto(): boolean {
      return false;
  }

  public reinicializar(): void {
      this.clienteSeleccionado = null;
      this._selectorClientes.resetearFiltros();
      this.productosResumen = null;
      this.direccionSeleccionada = null;
      this.fechaEntrega = this.fechaMinima;
      this.slider.slideTo(0);
      this.slider.lockSwipeToNext(true);
      this.pedidoPendienteSeleccionado = undefined;
      this.listaPedidosPendientes = undefined;
      this.regalosSeleccionados = [];
      this.productosBonificablesCount = -1; // Resetear verificación de productos bonificables
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

  /*
  private ajustarFechaEntrega(fecha: Date): Promise<Date> {
      console.log("Ajustar fecha");
      fecha.setHours(fecha.getHours() - fecha.getTimezoneOffset() / 60);
      return new Promise<any>((resolve, reject) => {        
        this.servicio.calcularFechaEntrega(fecha, this.direccionSeleccionada ? this.direccionSeleccionada.ruta : "FW", this.almacen)
          .subscribe(
            data => {
                if (data && typeof data === 'string') {
                    // Convertir la cadena de fecha a un objeto Date
                    const fechaConvertida = new Date(data);
              
                    // Ajustar la fecha según sea necesario
                    fechaConvertida.setHours(fechaConvertida.getHours() - fechaConvertida.getTimezoneOffset() / 60);
              
                    return fechaConvertida;
                  } else {
                    throw new Error('El resultado no es una cadena de fecha válida.');
                  }
            },
            async error => {
              let alert = await this.alertCtrl.create({
                message: 'Error',
                subHeader: 'No se ha podido ajustar la fecha de entrega:\n' + error.ExceptionMessage,
                buttons: ['Ok'],
              });
              await alert.present();
              reject(error);
            }
          );
      });
  }
  */
  private ajustarFechaEntrega(fecha: Date): Promise<Date> {
    console.log("Ajustar fecha");
    fecha.setHours(fecha.getHours() - fecha.getTimezoneOffset() / 60);

    return new Promise<Date>((resolve, reject) => {
        this.servicio.calcularFechaEntrega(fecha, this.direccionSeleccionada ? this.direccionSeleccionada.ruta : "FW", this.almacen)
            .subscribe(
                data => {
                    if (data && typeof data === 'string') {
                        // Convertir la cadena de fecha a un objeto Date
                        const fechaConvertida = new Date(data);

                        // Ajustar la fecha según sea necesario
                        fechaConvertida.setHours(fechaConvertida.getHours() - fechaConvertida.getTimezoneOffset() / 60);

                        resolve(fechaConvertida);
                    } else {
                        reject(new Error('El resultado no es una cadena de fecha válida.'));
                    }
                },
                error => {
                    reject(error);
                }
            );
        });
    }

  public abrirDetalle(producto: string, almacen: string): void {
    this._selectorPlantillaVenta.abrirDetalle(producto, almacen);
  }

  public esTarjetaPrepago(): boolean {
      return this.iva && this.formaPago == "TAR" && this.plazosPago == "PRE";
  }
/*
  public cargarCorreoYMovilTarjeta() {
      this.servicio.leerCliente(this.clienteSeleccionado.empresa, this.clienteSeleccionado.cliente, this.direccionSeleccionada.contacto)
      .subscribe(
        data => {
            var cliente = data;
            var telefonos = cliente.telefono.split("/");
            this.cobroTarjetaMovil = telefonos.find(x => x.startsWith("6") || x.startsWith("7") || x.startsWith("8"));
            var personaContacto = cliente.personasContacto.find(x => x.facturacionElectronica);
            if (personaContacto){
                this.cobroTarjetaCorreo = personaContacto.correoElectronico;
            }
            
            if (!this.cobroTarjetaCorreo){
                personaContacto = cliente.personasContacto.find(x => x.correoElectronico)
                if (personaContacto){
                    this.cobroTarjetaCorreo = personaContacto.correoElectronico;    
                }
            }
        },
        async error => {
            let alert = await this.alertCtrl.create({
                message: 'Error',
                subHeader: 'No se han podido cargar los datos del cliente:\n' + error.ExceptionMessage,
                buttons: ['Ok'],
            });
            await alert.present();
        }
    )    
  }
*/
  public async calcularFechaMinima(){
    this.fechaMinima = (await this.ajustarFechaEntrega(this.hoySinHora)).toISOString().substring(0, 10);
    this.fechaEntrega = this.fechaMinima;    
  }

  public async cargarCorreoYMovilTarjeta() {
    try {
      const data = await this.servicio.leerCliente(this.clienteSeleccionado.empresa, this.clienteSeleccionado.cliente, this.direccionSeleccionada.contacto).toPromise();
  
      const cliente = data;
      const telefonos = cliente.Telefono.split("/");
      this.cobroTarjetaMovil = telefonos.find(x => x.startsWith("6") || x.startsWith("7") || x.startsWith("8"));
  
      const personaContactoFacturacion = cliente.PersonasContacto.find(x => x.FacturacionElectronica);
      if (personaContactoFacturacion) {
        this.cobroTarjetaCorreo = personaContactoFacturacion.CorreoElectronico;
      }
  
      if (!this.cobroTarjetaCorreo) {
        const personaContactoCorreo = cliente.PersonasContacto.find(x => x.CorreoElectronico);
        if (personaContactoCorreo) {
          this.cobroTarjetaCorreo = personaContactoCorreo.CorreoElectronico;
        }
      }
    } catch (error) {
      let alert = await this.alertCtrl.create({
        message: 'Error',
        subHeader: 'No se han podido cargar los datos del cliente:\n' + error.ExceptionMessage,
        buttons: ['Ok'],
      });
      await alert.present();
    }
  }
  public noSePuedeCrearPedido(): boolean {
    return this.direccionSeleccionada.iva && ((!this.clienteSeleccionado.cifNif && !this.esPresupuesto) || !this.formaPago || !this.plazosPago);
  }

  public cambiarPlazosPago(nuevosPlazos: string) {
    this.plazosPago = nuevosPlazos;
    this.comprobarSiSePuedeServirPorGlovo();
  }

  public mandarCobroTarjeta: boolean;
  public cobroTarjetaCorreo: string;
  public cobroTarjetaMovil: string;

  private redondea(value) {
    return Number(Math.round(value * 100) / 100);
  }

  /**
   * Maneja errores de creación de pedido, permitiendo forzar si el usuario tiene permiso
   */
  private async manejarErrorCreacionPedido(error: ProcessedApiError, yaForzado: boolean): Promise<void> {
    const mensaje = this.errorHandler.extractErrorMessage(error);

    // Verificar si es un error de validación (formato nuevo o antiguo)
    const esErrorValidacion = this.esErrorDeValidacion(error, mensaje);
    const puedeForzar = this.usuario.permitirCrearPedidoConErroresValidacion && !yaForzado;

    if (esErrorValidacion && puedeForzar) {
      // Mostrar diálogo con opción de forzar
      const alert = await this.alertCtrl.create({
        header: 'Error de Validación',
        message: mensaje + '\n\n¿Desea crear el pedido de todas formas?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Crear sin validar',
            handler: () => {
              this.crearPedidoForzado();
            }
          }
        ]
      });
      await alert.present();
    } else {
      // Error normal, solo mostrar mensaje
      const alert = await this.alertCtrl.create({
        header: 'Error',
        subHeader: 'No se ha podido crear el pedido',
        message: mensaje,
        buttons: ['Ok']
      });
      await alert.present();
    }
  }

  /**
   * Crea el pedido forzando la validación
   */
  private async crearPedidoForzado(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Creando Pedido (sin validar)...',
    });
    await loading.present();

    this.servicio.crearPedido(this.prepararPedido(), true).subscribe(
      async data => {
        this.firebaseAnalytics.logEvent("plantilla_venta_crear_pedido_forzado", { pedido: data.numero });
        const alert = await this.alertCtrl.create({
          header: 'Creado',
          message: 'Pedido ' + data.numero + ' creado correctamente',
          buttons: ['Ok']
        });
        await alert.present();
        await loading.dismiss();
        this.reinicializar();
      },
      async error => {
        await loading.dismiss();
        // Ya no intentar forzar de nuevo
        await this.manejarErrorCreacionPedido(error, true);
      },
      async () => {
        await loading.dismiss();
      }
    );
  }

  /**
   * Detecta si un error es de validación de precios/descuentos
   * Soporta tanto el formato nuevo (con código) como el antiguo (por mensaje)
   */
  private esErrorDeValidacion(error: ProcessedApiError, mensaje: string): boolean {
    // Formato nuevo estructurado
    if (error.apiError?.error?.code === ApiErrorCode.PEDIDO_VALIDACION_FALLO) {
      return true;
    }

    // Formato antiguo: detectar por el mensaje
    const patronesValidacion = [
      'no se encuentra autorizado el descuento',
      'descuento no autorizado',
      'precio no válido',
      'oferta no válida',
      'validación'
    ];

    const mensajeLower = mensaje.toLowerCase();
    return patronesValidacion.some(patron => mensajeLower.includes(patron));
  }
}
