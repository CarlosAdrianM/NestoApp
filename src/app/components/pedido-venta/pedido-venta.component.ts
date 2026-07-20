import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { NavController, AlertController, LoadingController, NavParams } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { LineaVenta } from '../linea-venta/linea-venta';
import { PedidoVenta } from './pedido-venta';
import { PedidoVentaService } from './pedido-venta.service';
import { PlantillaVentaService } from '../plantilla-venta/plantilla-venta.service';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ApiErrorCode, ProcessedApiError } from 'src/app/models/api-error.model';

@Component({
    selector: 'app-pedido-venta',
    templateUrl: './pedido-venta.component.html',
    styleUrls: ['./pedido-venta.component.scss'],
    standalone: false
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
  public recogerProducto: boolean = false;
  // Recuerda la etiqueta de recogida pendiente detectada al cargar (Retorno=1, Estado<0),
  // para saber si al sincronizar hay que crearla o cancelarla.
  private envioRecogidaExistente: any = null;
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
    private errorHandler: ErrorHandlerService,
    private plantillaVentaService: PlantillaVentaService
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
              this.cargarSeguimientos(empresa, numero);
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
  
  public async onServirJuntoChange(event: any): Promise<void> {
      const nuevoValor = event.detail.checked;
      if (nuevoValor || !this.pedido) return;

      const lineasPedido = (this.pedido.Lineas || [])
          .filter(l => l.tipoLinea === 1 && l.Producto && l.Cantidad > 0)
          .map(l => ({
              ProductoId: l.Producto,
              Cantidad: l.Cantidad,
              EsBonificadoGanavisiones: l.DescuentoLinea === 1 && l.AplicarDescuento === false
          }));
      const almacen = this.pedido.Lineas?.[0]?.almacen || 'ALG';
      const datosPedido = {
          formaPago: this.pedido.formaPago,
          plazosPago: this.pedido.plazosPago,
          ccc: this.pedido.formaPago === 'RCB' ? this.pedido.ccc : null,
          periodoFacturacion: this.pedido.periodoFacturacion,
          notaEntrega: this.pedido.notaEntrega
      };

      this.plantillaVentaService.validarServirJunto(almacen, [], lineasPedido, datosPedido).subscribe(
          async (response) => {
              if (!response.PuedeDesmarcar) {
                  this.pedido.servirJunto = true;
                  const alert = await this.alertCtrl.create({
                      header: 'No se puede desmarcar',
                      message: response.Mensaje || 'No se puede desmarcar "Servir Junto" porque hay productos que se quedarían pendientes.',
                      buttons: ['Ok']
                  });
                  await alert.present();
                  return;
              }

              if (response.Aviso) {
                  const confirm = await this.alertCtrl.create({
                      header: 'Comisión contra reembolso',
                      message: response.Aviso,
                      buttons: [
                          { text: 'Cancelar', role: 'cancel' },
                          { text: 'Continuar', role: 'confirm' }
                      ]
                  });
                  await confirm.present();
                  const { role } = await confirm.onDidDismiss();
                  if (role === 'cancel') {
                      this.pedido.servirJunto = true;
                  }
              }
          },
          (error) => {
              console.error('Error validando ServirJunto:', error);
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
                              // Sincronizar la etiqueta de recogida según el checkbox, igual que
                              // plantilla-venta crea la etiqueta tras crear el pedido.
                              await this.sincronizarRecogerProducto();
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


  /**
   * Issue #151: el botón "Pasar a presupuesto" se muestra cuando el pedido NO es
   * presupuesto y tiene alguna línea pendiente (-1) o en curso (1) sin picking.
   * (Réplica de CanPasarAPresupuesto de Nesto#356.)
   */
  public puedePasarAPresupuesto(): boolean {
      if (!this.pedido || this.pedido.EsPresupuesto) {
          return false;
      }
      return (this.pedido.Lineas || []).some(l => l.picking == 0 && (l.estado == -1 || l.estado == 1));
  }

  /**
   * Issue #151: convierte el pedido en presupuesto. Pasa las líneas pendientes/en curso
   * sin picking a estado -3 (presupuesto) y marca la cabecera con EsPresupuesto=true (flag
   * que NestoAPI#193 usa para distinguir "pasar a presupuesto" de "aceptar presupuesto").
   * Las líneas facturadas o con picking no se tocan. Guarda con modificarPedido.
   */
  public async pasarAPresupuesto(): Promise<void> {
      const confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea pasar el pedido a presupuesto?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      const loading: any = await this.loadingCtrl.create({
                          message: 'Pasando a presupuesto...',
                      });
                      this.firebaseAnalytics.logEvent("pedido_venta_pasar_a_presupuesto", { pedido: this.pedido.numero });
                      await loading.present();

                      this.pedido.Lineas.forEach(l => {
                          if (l.picking == 0 && (l.estado == -1 || l.estado == 1)) {
                              l.estado = -3;
                          }
                      });
                      this.pedido.EsPresupuesto = true;

                      this.servicio.modificarPedido(this.pedido).subscribe(
                          async data => {
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              const alert = await this.alertCtrl.create({
                                  header: 'Presupuesto',
                                  message: 'Pedido pasado a presupuesto correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                              await loading.dismiss();
                              // Recargar para descartar los cambios locales que no se guardaron.
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              const mensaje = this.errorHandler.extractErrorMessage(error);
                              const alert = await this.alertCtrl.create({
                                  header: 'Error',
                                  subHeader: 'No se ha podido pasar el pedido a presupuesto',
                                  message: mensaje,
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                          },
                          () => { }
                      );
                  }
              },
              { text: 'No', handler: () => { return; } }
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

  private cargarSeguimientos(empresa: string, numero: number): void {
      this.servicio.cargarEnlacesSeguimiento(empresa, numero).subscribe(
          data => {
              this.listaEnlacesSeguimiento = data;
              // Detectar etiqueta de recogida pendiente (Retorno=1, Estado<0).
              const recogida = (data || []).find((e: any) => e.Retorno === 1 && e.Estado < 0);
              if (recogida) {
                  this.recogerProducto = true;
                  this.envioRecogidaExistente = recogida;
              } else {
                  this.recogerProducto = false;
                  this.envioRecogidaExistente = null;
              }
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
          }
      );
  }

  // Aplica el cambio del checkbox "Recoger Producto" contra el backend:
  // - marcado y sin etiqueta previa -> crea etiqueta pendiente (Agencia=1, Retorno=1)
  // - desmarcado y con etiqueta previa -> cancela la etiqueta pendiente
  // Tras éxito recarga seguimientos; en error avisa y revierte el checkbox visual.
  public async sincronizarRecogerProducto(): Promise<void> {
      if (!this.pedido) {
          return;
      }
      const debeCrear = this.recogerProducto && !this.envioRecogidaExistente;
      const debeCancelar = !this.recogerProducto && this.envioRecogidaExistente;
      if (!debeCrear && !debeCancelar) {
          return;
      }

      const peticion = debeCrear
          ? this.servicio.crearEtiquetaPendiente(this.pedido.empresa, this.pedido.numero, 1, 1)
          : this.servicio.cancelarEtiquetaPendiente(this.envioRecogidaExistente.Numero);

      return new Promise<void>((resolve) => {
          peticion.subscribe(
              () => {
                  this.firebaseAnalytics.logEvent(
                      debeCrear ? "pedido_venta_recoger_producto_crear" : "pedido_venta_recoger_producto_cancelar",
                      { pedido: this.pedido.numero }
                  );
                  // Recargar desde el backend refresca listaEnlacesSeguimiento y
                  // recalcula recogerProducto/envioRecogidaExistente.
                  this.cargarSeguimientos(this.pedido.empresa, this.pedido.numero);
                  resolve();
              },
              async error => {
                  // Revertir el checkbox visual al estado real (había/no había etiqueta).
                  this.recogerProducto = !!this.envioRecogidaExistente;
                  const mensaje = this.errorHandler.extractErrorMessage(error);
                  let alert = await this.alertCtrl.create({
                      header: 'Error',
                      subHeader: 'No se ha podido actualizar "Recoger Producto"',
                      message: mensaje,
                      buttons: ['Ok'],
                  });
                  await alert.present();
                  resolve();
              }
          );
      });
  }

  // Estados canónicos de agencia (Constantes.Agencias en NestoAPI):
  // -1 Pendiente, 0 En curso, 1 Tramitado, 2 Entregado, 3 Incidentado, 4 Devuelto.
  public textoEstadoEnvio(estado: number): string {
      switch (estado) {
          case -1: return 'Pendiente';
          case 0: return 'En curso';
          case 1: return 'Tramitado';
          case 2: return 'Entregado';
          case 3: return 'Incidentado';
          case 4: return 'Devuelto';
          default: return 'Desconocido';
      }
  }

  public colorEstadoEnvio(estado: number): string {
      switch (estado) {
          case 2: return 'success';    // Entregado
          case 3: return 'danger';     // Incidentado
          case 4: return 'warning';    // Devuelto
          case 1: return 'primary';    // Tramitado
          default: return 'medium';    // Pendiente / En curso / Desconocido
      }
  }

  public async actualizarSeguimiento(enlace: any): Promise<void> {
      const loading: any = await this.loadingCtrl.create({ message: 'Consultando la agencia...' });
      await loading.present();
      this.firebaseAnalytics.logEvent("pedido_venta_actualizar_seguimiento", {envio: enlace.Numero});
      this.servicio.actualizarSeguimientoEnvio(enlace.Numero).subscribe(
          async () => {
              await loading.dismiss();
              // Recargar desde el DTO persistido para reflejar el nuevo Estado en el badge.
              this.cargarSeguimientos(this.pedido.empresa, this.pedido.numero);
          },
          async error => {
              await loading.dismiss();
              const mensaje = this.errorHandler.extractErrorMessage(error);
              let alert = await this.alertCtrl.create({
                  header: 'Error',
                  subHeader: 'No se ha podido actualizar el estado del envío',
                  message: mensaje,
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
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
              await this.sincronizarRecogerProducto();
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
