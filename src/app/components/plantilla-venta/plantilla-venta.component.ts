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
    private firebaseAnalytics: FirebaseAnalytics
    ) {
      this.almacen = this.usuario.almacen;
      events.subscribe('clienteModificado', (clienteModificado: any) => {
          this.clienteSeleccionado = clienteModificado;
          this.cargarProductos(clienteModificado);
      });
      events.subscribe('carritoModificado', () => {
          this.slider.getActiveIndex().then(i => {
              if (i === 2) { //resumen
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
    } else if (this.indexActivo === 4 && indexPrevio === 3) {
        console.log("Finalizar");
        this.comprobarSiSePuedeServirPorGlovo();
    } /*else if (slides.getActiveIndex() === 1) {
        setTimeout(() => {
            this._selectorPlantillaVenta.setFocus();
        }, 150);
    }
    */
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

    return  this.indexActivo === 0 && this.clienteSeleccionado ||
            this.indexActivo === 1 && this._selectorPlantillaVenta.hayAlgunProducto() ||
            this.indexActivo === 2 && this.productosResumen && this.productosResumen.length > 0 ||
            this.indexActivo === 3;
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
                let alert = await this.alertCtrl.create({
                    header: 'Error',
                    subHeader: 'No se ha podido crear el pedido',
                    message: error.ExceptionMessage,
                    buttons: ['Ok'],
                });
                await alert.present();
                await loading.dismiss();
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
                let alert = await this.alertCtrl.create({
                    header: 'Error',
                    subHeader: 'No se ha podido ampliar el pedido',
                    message: error.ExceptionMessage,
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
}
