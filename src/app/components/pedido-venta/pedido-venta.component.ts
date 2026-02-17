import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { NavController, AlertController, LoadingController, NavParams } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { LineaVenta } from '../linea-venta/linea-venta';
import { PedidoVenta } from './pedido-venta';
import { PedidoVentaService } from './pedido-venta.service';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ApiErrorCode, ProcessedApiError } from 'src/app/models/api-error.model';

@Component({
  selector: 'app-pedido-venta',
  templateUrl: './pedido-venta.component.html',
  styleUrls: ['./pedido-venta.component.scss'],
})
export class PedidoVentaComponent  {

  public hoy: Date = new Date();
  private iva: string;
  private nav: NavController;
  public pedido: PedidoVenta;
  public segmentoPedido: string = 'cabecera';
  private servicio: PedidoVentaService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;
  private _fechaEntrega: string;
  public listaEnlacesSeguimiento;
  get fechaEntrega() {
      return this._fechaEntrega;
  }
  set fechaEntrega(value: string) {
      if (this._fechaEntrega) {
          this.pedido.Lineas.forEach(l => {
              if (l.picking == 0 && (l.estado == -1 || l.estado == 1)) {
                  l.fechaEntrega = value;
              }
          });
      }
      this._fechaEntrega = value;
  }

      
  constructor(servicio: PedidoVentaService,
    nav: NavController,
    alertCtrl: AlertController,
    loadingCtrl: LoadingController,
    private usuario: Usuario,
    private route: ActivatedRoute,
    private firebaseAnalytics: FirebaseAnalytics,
    private errorHandler: ErrorHandlerService
    ) {
      this.nav = nav;
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      this.cargarPedido(this.route.snapshot.queryParams.empresa,this.route.snapshot.queryParams.numero);
  }

  public async cargarPedido(empresa: string, numero: number): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Pedido...',
      });

      await loading.present();

      this.servicio.cargarPedido(empresa, numero).subscribe(
          data => {
              this.firebaseAnalytics.logEvent("cargar_pedido", {empresa: empresa, pedido: numero});
              this.pedido = data as PedidoVenta;
              for (let i = 0; i < this.pedido.Lineas.length; i++) {
                  this.pedido.Lineas[i] = new LineaVenta(this.pedido.Lineas[i]);
              }
              this.iva = this.pedido.iva;
              this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
              this.pedido.vendedor = this.pedido.vendedor.trim(); // Cambiar en la API
              if (this.pedido.Lineas && this.pedido.Lineas.length > 0) {
                  this.fechaEntrega = this.pedido.Lineas[0].fechaEntrega.toString();
              }
              // Cargar parámetros de IVA y asignarlos a las líneas
              this.cargarParametrosIva();
              this.servicio.cargarEnlacesSeguimiento(empresa, numero).subscribe(
                  data => {
                      this.listaEnlacesSeguimiento = data;
                  },
                  async error => {
                      const mensaje = this.errorHandler.extractErrorMessage(error);
                      let alert = await this.alertCtrl.create({
                          header: 'Error',
                          subHeader: 'No se han podido cargar los seguimientos del pedido',
                          message: mensaje,
                          buttons: ['Ok'],
                      });
                      await alert.present();
                      await loading.dismiss();
                  }
              )
          },
          async error => {
              const mensaje = this.errorHandler.extractErrorMessage(error);
              let alert = await this.alertCtrl.create({
                  header: 'Error',
                  subHeader: 'No se ha podido cargar el pedido',
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
  
  public seleccionarFormaPago(evento: any): void {
      this.firebaseAnalytics.logEvent("pedido_seleccionar_forma_pago", {pedido:this.pedido.numero, formaPago: evento});
      this.pedido.formaPago = evento;
  }

  public seleccionarPlazosPago(evento: any): void {
    this.firebaseAnalytics.logEvent("pedido_seleccionar_plazos_pago", {pedido:this.pedido.numero, plazosPago: evento});
    this.pedido.plazosPago = evento.plazoPago;
    this.pedido.DescuentoPP = evento.descuentoPP;
  }

  public cambiarIVA(): void {
      this.firebaseAnalytics.logEvent("pedido_cambiar_iva", {actual: this.pedido.iva, nuevo: this.pedido.iva ? undefined : this.iva});
      this.pedido.iva = this.pedido.iva ? undefined : this.iva;
  }

  public abrirLinea(linea: LineaVenta) {
      this.firebaseAnalytics.logEvent("pedido_venta_abrir_linea", {linea: linea, cliente: this.pedido.cliente, contacto: this.pedido.contacto});
      this.nav.navigateForward('linea-venta', { queryParams: {linea: linea, cliente: this.pedido.cliente, contacto: this.pedido.contacto}});
  }

  public annadirLinea() {
      this.firebaseAnalytics.logEvent("pedido_venta_annadir_linea", {pedido: this.pedido.numero});
      let linea: LineaVenta = new LineaVenta();
      linea.copiarDatosPedido(this.pedido);
      linea.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      this.abrirLinea(linea);
      this.pedido.Lineas = this.pedido.Lineas.concat(linea);
  }

  public async borrarLinea(linea: LineaVenta) {
      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea borrar la línea?',
          buttons: [
              {
                  text: 'Sí',
                  handler: () => {
                      this.firebaseAnalytics.logEvent("pedido_venta_borrar_linea", {pedido: this.pedido.numero, linea:linea.id});
                      this.pedido.Lineas = this.pedido.Lineas.filter(obj => obj !== linea);
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });
      await confirm.present();
  }

  public async modificarPedido(): Promise<void> {

      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Está seguro que quiere modificar el pedido?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      // Hay que guardar el pedido original en alguna parte
                      let loading: any = await this.loadingCtrl.create({
                          message: 'Modificando Pedido...',
                      });

                      await loading.present();

                      this.servicio.modificarPedido(this.pedido).subscribe(
                          async data => {
                              this.firebaseAnalytics.logEvent("modificar_pedido_venta", {pedido: this.pedido.numero});
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              let alert = await this.alertCtrl.create({
                                  header: 'Modificado',
                                  message: 'Pedido modificado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                              await loading.dismiss();
                              await this.manejarErrorModificacionPedido(error, false);
                          },
                          () => {
                              //loading.dismiss();
                          }
                      );
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });

      await confirm.present();
  }

  
  public async aceptarPresupuesto(): Promise<void> {

      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea aceptar el presupuesto?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      // Hay que guardar el pedido original en alguna parte
                      let loading: any = await this.loadingCtrl.create({
                          message: 'Aceptando presupuesto...',
                      });
                      this.firebaseAnalytics.logEvent("pedido_venta_aceptar_presupuesto", {pedido: this.pedido.numero});
                      await loading.present();

                      this.pedido.EsPresupuesto = false;
                      this.servicio.modificarPedido(this.pedido).subscribe(
                          async data => {
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              let alert = await this.alertCtrl.create({
                                  header: 'Aceptado',
                                  message: 'Presupuesto aceptado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                              const mensaje = this.errorHandler.extractErrorMessage(error);
                              let alert = await this.alertCtrl.create({
                                  header: 'Error',
                                  subHeader: 'No se ha podido aceptar el presupuesto',
                                  message: mensaje,
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          () => {
                              //loading.dismiss();
                          }
                      );
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });

      await confirm.present();
  }


  public cadenaFecha(cadena: string): Date {
      return new Date(cadena);
  }

  public abrirEnlace(urlDestino: string): void {
      this.firebaseAnalytics.logEvent("pedido_venta_abrir_enlace", {enlace: urlDestino});
      window.open(urlDestino, '_system', 'location=yes');
  }

  private cargarParametrosIva(): void {
      if (!this.pedido || !this.pedido.iva) {
          return;
      }
      this.servicio.cargarParametrosIva(this.pedido.empresa, this.pedido.iva).subscribe(
          (parametros: ParametrosIva[]) => {
              this.pedido.parametrosIva = parametros;
              // Asignar parámetros a cada línea y actualizar porcentajes
              for (const linea of this.pedido.Lineas) {
                  linea.parametrosIva = parametros;
                  linea.actualizarPorcentajeIva();
              }
          },
          error => {
              console.error('Error al cargar parámetros de IVA:', error);
          }
      );
  }

  /**
   * Maneja errores de modificación de pedido, permitiendo forzar si el usuario tiene permiso
   */
  private async manejarErrorModificacionPedido(error: ProcessedApiError, yaForzado: boolean): Promise<void> {
      const mensaje = this.errorHandler.extractErrorMessage(error);

      // Verificar si es un error de validación (formato nuevo o antiguo)
      const esErrorValidacion = this.esErrorDeValidacion(error, mensaje);
      const puedeForzar = this.usuario.permitirCrearPedidoConErroresValidacion && !yaForzado;

      if (esErrorValidacion && puedeForzar) {
          // Mostrar diálogo con opción de forzar
          const alert = await this.alertCtrl.create({
              header: 'Error de Validación',
              message: mensaje + '\n\n¿Desea modificar el pedido de todas formas?',
              buttons: [
                  {
                      text: 'Cancelar',
                      role: 'cancel'
                  },
                  {
                      text: 'Modificar sin validar',
                      handler: () => {
                          this.modificarPedidoForzado();
                      }
                  }
              ]
          });
          await alert.present();
      } else {
          // Error normal, solo mostrar mensaje
          const alert = await this.alertCtrl.create({
              header: 'Error',
              subHeader: 'No se ha podido modificar el pedido',
              message: mensaje,
              buttons: ['Ok']
          });
          await alert.present();
      }
  }

  /**
   * Modifica el pedido forzando la validación
   */
  private async modificarPedidoForzado(): Promise<void> {
      const loading = await this.loadingCtrl.create({
          message: 'Modificando Pedido (sin validar)...',
      });
      await loading.present();

      this.servicio.modificarPedido(this.pedido, true).subscribe(
          async data => {
              this.firebaseAnalytics.logEvent("modificar_pedido_venta_forzado", { pedido: this.pedido.numero });
              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
              const alert = await this.alertCtrl.create({
                  header: 'Modificado',
                  message: 'Pedido modificado correctamente',
                  buttons: ['Ok']
              });
              await alert.present();
              await loading.dismiss();
          },
          async error => {
              await loading.dismiss();
              // Ya no intentar forzar de nuevo
              await this.manejarErrorModificacionPedido(error, true);
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
