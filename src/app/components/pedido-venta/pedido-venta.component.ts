import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { NavController, AlertController, LoadingController, NavParams, ModalController, IonicSafeString, ActionSheetController, ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { LineaVenta } from '../linea-venta/linea-venta';
import { firstValueFrom, Observable } from 'rxjs';
import { PedidoVenta } from './pedido-venta';
import { PedidoVentaService, AGENCIA_LA_ELIGE_EL_COMPARADOR } from './pedido-venta.service';
import { PlantillaVentaService } from '../plantilla-venta/plantilla-venta.service';
import { ParametrosIva } from 'src/app/models/parametros-iva.model';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ApiErrorCode, ProcessedApiError } from 'src/app/models/api-error.model';
import { LISTA_MODOS_SERVICIO, MODOS_SERVICIO, esTodoJunto, modoEfectivo, leerModoServicioNoPermitido, leerModoConPicking, nombreModo, esRetenido, NOMBRE_MODO_RETENIDO, ModoServicioItem, ORIGEN_MODO_SERVICIO } from 'src/app/models/modos-servicio.model';
import { RetencionPedido, hastaFechaParaApi, textoRetencion } from 'src/app/models/retencion-pedido.model';
import { OpcionesModosPedido, TEXTO_SERVIR_PENDIENTE_AL_HABER_STOCK, casillaServirPendienteVisible, facturacionVisible, servirPendienteParaGuardar } from 'src/app/models/opciones-modos.model';
import { leerFechaEntregaLejana } from 'src/app/models/fecha-entrega-lejana.model';
import { AVISO_SIN_FECHA_ENTREGA, esFechaSinDeterminar, textoFechaEntrega } from 'src/app/utils/fechas';
import { ValidarServirJuntoResponse } from 'src/app/models/ganavisiones.model';
import { conAvisoTodoJunto, lineasQueImpidenSalirDeTodoJunto, textoNoSeHanQuitado, textoOfrecerQuitarLineas, textoSeQuedaEnTodoJunto } from 'src/app/models/servir-junto.model';
import { SolicitudCambioModoService } from 'src/app/services/solicitud-cambio-modo.service';
import {
    LISTA_MODOS_FACTURACION, MODOS_FACTURACION, AVISO_TODO_AHORA, ModoFacturacionSugerido, ModoFacturacionPermitido,
    modoFacturacionDerivado, esModoFacturacionPermitido, huellaModoFacturacion, selectorFacturacionBloqueado
} from 'src/app/models/modos-facturacion.model';
import { CambiarClientePedidoRespuesta, puedeCambiarClientePedido, mensajeCambiosCliente } from 'src/app/models/cambio-cliente-pedido.model';
import { ModalElegirClienteComponent } from './modal-elegir-cliente.component';

import { FechaEntregaAgencia, textoFechaEntregaAgencia, textoFechaPrometida } from 'src/app/models/fecha-entrega-agencia.model';
import { BultoPedido, enlacePublicoFotoBulto, textoBulto } from 'src/app/models/bultos-pedido.model';
import { VisorImagenComponent } from '../visor-imagen/visor-imagen.component';
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
    private plantillaVentaService: PlantillaVentaService,
    private solicitudCambioModo: SolicitudCambioModoService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
    ) {
      this.nav = nav;
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      // NestoApp#197: por queryParams y no por el snapshot, para que abrir el pedido origen de una
      // nota de entrega recargue aunque Ionic reutilice esta misma página.
      this.route.queryParams.subscribe(params => {
          if (params?.numero && (!this.pedido || +params.numero !== +this.pedido.numero)) {
              this.cargarPedido(params.empresa || '1', params.numero);
          }
      });
  }

  public async cargarPedido(empresa: string, numero: number): Promise<void> {
      const loading: any = await this.loadingCtrl.create({
          message: 'Cargando Pedido...',
      });

      await loading.present();

      this.servicio.cargarPedido(empresa, numero).subscribe(
          data => {
              this.firebaseAnalytics.logEvent("cargar_pedido", {empresa: empresa, pedido: numero});
              this.pedido = data as PedidoVenta;
              this.modoServicioGuardado = this.modoServicioPedido;
              // NestoApp#197: lo que trae la API es lo guardado, no una elección del vendedor.
              this.modoFacturacionTocado = false;
              this.huellaFacturacion = '';
              this.sugerenciaFacturacion = null;
              this.opcionesModos = null; // NestoApp#242
              this.servirPendienteTocado = false;
              this.confirmarFechaLejana = false; // NestoApp#252
              for (let i = 0; i < this.pedido.Lineas.length; i++) {
                  this.pedido.Lineas[i] = new LineaVenta(this.pedido.Lineas[i]);
              }
              this.iva = this.pedido.iva;
              this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
              this.pedido.vendedor = this.pedido.vendedor.trim(); // Cambiar en la API
              if (this.pedido.Lineas && this.pedido.Lineas.length > 0) {
                  this.fechaEntrega = this.pedido.Lineas[0].fechaEntrega.toString();
              }
              this.huellaGuardada = this.huellaPedido(); // NestoApp#198
              // Cargar parámetros de IVA y asignarlos a las líneas
              this.cargarParametrosIva();
              this.cargarSeguimientos(empresa, numero);
              this.cargarFechaEntregaAgencia(empresa, numero); // NestoApp#215
              this.cargarBultos(empresa, numero); // NestoApp#223
              this.pedirModoFacturacionSugerido();
          },
          async error => {
              const mensaje = this.errorHandler.extractErrorMessage(error);
              const alert = await this.alertCtrl.create({
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
  
  // NestoApp#215 (NestoAPI#606): qué día se entrega a la agencia (ahora) y qué se prometió al crearlo.
  public fechaEntregaAgencia: FechaEntregaAgencia | null = null;

  public cargarFechaEntregaAgencia(empresa: string, numero: number): void {
      this.fechaEntregaAgencia = null;
      this.servicio.cargarFechaEntregaAgencia(empresa, numero).subscribe(fecha => this.fechaEntregaAgencia = fecha);
  }

  get textoFechaEntregaAgencia(): string {
      return textoFechaEntregaAgencia(this.fechaEntregaAgencia);
  }

  get textoFechaPrometida(): string {
      return textoFechaPrometida(this.fechaEntregaAgencia);
  }

  // ---- NestoApp#223 (Nesto#522): fotos del packing de cada bulto, para enseñarlas tras una reclamación ----

  public bultos: BultoPedido[] = [];
  /** Enlace temporal de cada foto (por Id de bulto), para la miniatura y el visor. */
  public fotosBultos: { [id: number]: string } = {};
  public readonly textoBulto = textoBulto;

  public cargarBultos(empresa: string, numero: number): void {
      this.bultos = [];
      this.fotosBultos = {};
      this.servicio.cargarBultos(empresa, numero).subscribe(bultos => {
          this.bultos = bultos;
          for (const bulto of bultos.filter(b => b.TieneFoto)) {
              this.servicio.enlaceFotoBulto(bulto.Id).subscribe(enlace => {
                  if (enlace?.Url) {
                      this.fotosBultos[bulto.Id] = enlace.Url;
                  }
              });
          }
      });
  }

  public async verFotoBulto(bulto: BultoPedido): Promise<void> {
      const url = this.fotosBultos[bulto.Id];
      if (!url) {
          return;
      }
      this.firebaseAnalytics.logEvent('pedido_ver_foto_bulto', { pedido: bulto.Pedido, bulto: bulto.Bulto });
      const modal = await this.modalCtrl.create({ component: VisorImagenComponent, componentProps: { imgSrc: url }, cssClass: 'visor-imagen-modal' });
      await modal.present();
  }

  public enlacePublicoFoto(bulto: BultoPedido): string | null {
      return enlacePublicoFotoBulto(bulto, Configuracion.URL_SERVIDOR);
  }

  /**
   * La hoja de compartir del sistema si el WebView la tiene; si no (lo normal en Android), WhatsApp o
   * copiar el enlace. Se comparte el enlace público: el cliente lo abre sin usuario.
   */
  public async compartirFotoBulto(bulto: BultoPedido): Promise<void> {
      const enlace = this.enlacePublicoFoto(bulto);
      if (!enlace) {
          return;
      }
      const texto = `Foto del ${textoBulto(bulto).toLowerCase()} del pedido ${bulto.Pedido}: ${enlace}`;
      this.firebaseAnalytics.logEvent('pedido_compartir_foto_bulto', { pedido: bulto.Pedido, bulto: bulto.Bulto });
      const nav: any = navigator;
      if (nav.share) {
          try {
              await nav.share({ title: `Pedido ${bulto.Pedido}`, text: texto, url: enlace });
              return;
          } catch (error) {
              if (error?.name === 'AbortError') {
                  return;
              }
          }
      }
      const hoja = await this.actionSheetCtrl.create({
          header: 'Compartir la foto',
          buttons: [
              { text: 'Mandar por WhatsApp', icon: 'logo-whatsapp', handler: () => { window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_system'); } },
              { text: 'Copiar el enlace', icon: 'copy-outline', handler: () => { this.copiarEnlaceFoto(enlace); } },
              { text: 'Cancelar', role: 'cancel' }
          ]
      });
      await hoja.present();
  }

  private async copiarEnlaceFoto(enlace: string): Promise<void> {
      let mensaje = 'Enlace copiado';
      try {
          await navigator.clipboard.writeText(enlace);
      } catch {
          mensaje = 'No se ha podido copiar el enlace';
      }
      const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000 });
      await toast.present();
  }

  /** «Guardar»: se abre la foto en el navegador, donde se guarda manteniéndola pulsada. */
  public async guardarFotoBulto(bulto: BultoPedido): Promise<void> {
      const enlace = this.enlacePublicoFoto(bulto) || this.fotosBultos[bulto.Id];
      if (!enlace) {
          return;
      }
      this.firebaseAnalytics.logEvent('pedido_guardar_foto_bulto', { pedido: bulto.Pedido, bulto: bulto.Bulto });
      await Browser.open({ url: enlace });
  }

  // NestoApp#174 / NestoAPI#482: el toggle «Servir junto» pasa a ser un selector de modo.
  public readonly listaModosServicio = LISTA_MODOS_SERVICIO;

  // ---- NestoApp#254 / NestoAPI#698: retener el pedido «hasta nuevo aviso» ----

  /** Retenido (modo 5): el selector enseña «Retenido» y queda deshabilitado; se sale con «Liberar». */
  get estaRetenido(): boolean {
      return esRetenido(this.modoServicioPedido);
  }

  /** El 5 no se elige nunca: solo entra en la lista para que el selector enseñe su nombre mientras está retenido. */
  get listaModosServicioSelector(): ModoServicioItem[] {
      return this.estaRetenido
          ? [...LISTA_MODOS_SERVICIO, { codigo: MODOS_SERVICIO.RETENIDO, nombre: NOMBRE_MODO_RETENIDO, descripcion: 'Retenido hasta nuevo aviso: no sale en el picking.' }]
          : LISTA_MODOS_SERVICIO;
  }

  get textoRetencion(): string {
      return textoRetencion(this.pedido?.retencion);
  }

  /** Algo pendiente o en curso que retener (la API lo comprueba también). */
  get puedeRetener(): boolean {
      return !!this.pedido && !this.estaRetenido && !this.pedido.notaEntrega
          && (this.pedido.Lineas || []).some(l => l.estado === -1 || l.estado === 1);
  }

  public async retenerPedido(): Promise<void> {
      if (!this.puedeRetener) {
          return;
      }
      const alert = await this.alertCtrl.create({
          header: 'Retener el pedido',
          message: 'El pedido no saldrá en el picking hasta que lo libere (o hasta la fecha que indique). La fecha de entrega no cambia.',
          inputs: [
              { name: 'motivo', type: 'textarea', placeholder: 'Motivo (obligatorio)', attributes: { maxlength: 250 } },
              { name: 'hasta', type: 'date', placeholder: 'Hasta el (opcional)' }
          ],
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { text: 'Retener', handler: (datos: any) => { this.enviarRetencion(datos?.motivo, datos?.hasta); } }
          ]
      });
      await alert.present();
  }

  public async enviarRetencion(motivo: string, hasta: string | null): Promise<void> {
      const texto = (motivo || '').trim();
      if (!texto) {
          await this.avisar('Retener el pedido', 'Indique el motivo, por favor.');
          return;
      }
      const empresa = this.pedido.empresa;
      const numero = this.pedido.numero;
      const loading: any = await this.loadingCtrl.create({ message: 'Reteniendo el pedido...' });
      await loading.present();
      this.servicio.retener(empresa, numero, { Motivo: texto, HastaFecha: hastaFechaParaApi(hasta) }).subscribe({
          next: async (retencion: RetencionPedido) => {
              await loading.dismiss();
              this.firebaseAnalytics.logEvent('pedido_venta_retener', { pedido: numero });
              this.cargarPedido(empresa, numero);
              const toast = await this.toastCtrl.create({ message: textoRetencion(retencion), duration: 4000, color: 'success' });
              await toast.present();
          },
          error: async error => {
              await loading.dismiss();
              await this.avisar('No se ha podido retener el pedido', this.errorHandler.extractErrorMessage(error));
          }
      });
  }

  public async liberarPedido(): Promise<void> {
      if (!this.estaRetenido) {
          return;
      }
      const confirmado = await this.confirmar('Liberar el pedido',
          `¿Liberar el pedido ${this.pedido.numero}? Vuelve a su modo de entrega anterior y entra en el picking.`, 'Liberar');
      if (!confirmado) {
          return;
      }
      const empresa = this.pedido.empresa;
      const numero = this.pedido.numero;
      const loading: any = await this.loadingCtrl.create({ message: 'Liberando el pedido...' });
      await loading.present();
      this.servicio.liberar(empresa, numero).subscribe({
          next: async () => {
              await loading.dismiss();
              this.firebaseAnalytics.logEvent('pedido_venta_liberar', { pedido: numero });
              this.cargarPedido(empresa, numero);
              const toast = await this.toastCtrl.create({ message: `Pedido ${numero} liberado: entra en el picking.`, duration: 3000, color: 'success' });
              await toast.present();
          },
          error: async error => {
              await loading.dismiss();
              await this.avisar('No se ha podido liberar el pedido', this.errorHandler.extractErrorMessage(error));
          }
      });
  }

  // ---- NestoApp#240: fecha de entrega sin determinar (31/12/2099) ----

  public textoFecha(fecha: any): string {
      return textoFechaEntrega(fecha);
  }

  /** Alguna línea pendiente con la fecha «sin determinar»: hay que ponerla cuando se sepa. */
  get sinFechaEntrega(): boolean {
      return (this.pedido?.Lineas || []).some(l => (l.estado === -1 || l.estado === 1) && esFechaSinDeterminar(l.fechaEntrega));
  }
  public readonly avisoSinFechaEntrega = AVISO_SIN_FECHA_ENTREGA;

  /** El modo que rige: servirJunto marcado siempre es «todo junto»; un pedido viejo sin
   * modo enseña el derivado del bool. */
  get modoServicioPedido(): number {
      return modoEfectivo(this.pedido?.modoServicio, !!this.pedido?.servirJunto);
  }

  /** NestoApp#191: el modo que tiene el pedido en la BD, para volver a él si la API no deja cambiarlo. */
  private modoServicioGuardado: number | null = null;

  /** NestoApp#250: el vendedor ha cambiado el modo a mano en esta pantalla (se manda «Usuario» al guardar). */
  private modoServicioTocado = false;

  public cambiarModoServicio(nuevo: number): void {
      if (!this.pedido) return;
      const anterior = this.modoServicioPedido;
      if (anterior === nuevo) return;
      // NestoApp#254: retenido no se cambia desde aquí (la API lo rechaza): primero «Liberar».
      if (this.estaRetenido || esRetenido(nuevo)) return;

      this.pedido.modoServicio = nuevo;
      this.pedido.servirJunto = esTodoJunto(nuevo);
      this.modoServicioTocado = true;
      this.pedirModoFacturacionSugerido(); // NestoApp#242: con «Todo junto» la facturación se oculta

      // Salir de «todo junto» pasa por las mismas reglas que el desmarcado de antes;
      // entre modos parciales y hacia el 1, libre. El PUT posterior guarda el cambio.
      if (esTodoJunto(anterior) && !esTodoJunto(nuevo)) {
          this.validarSalidaDeTodoJunto(nuevo);
      }
  }

  /** Vuelve a «Todo junto» cuando el servidor o el usuario no aceptan salir de él. */
  private revertirATodoJunto(): void {
      this.pedido.modoServicio = MODOS_SERVICIO.TODO_JUNTO;
      this.pedido.servirJunto = true;
  }

  private validarSalidaDeTodoJunto(nuevoModo: number): void {
      this.pedirValidacionServirJunto(nuevoModo).subscribe(
          async (response) => {
              if (!response.PuedeDesmarcar) {
                  await this.ofrecerBorrarLineasQueImpiden(nuevoModo, response);
                  return;
              }
              await this.confirmarSalidaDeTodoJunto(response);
          },
          (error) => {
              console.error('Error validando ServirJunto:', error);
          }
      );
  }

  /** @param excluir líneas que no se mandan (las que el vendedor ha aceptado borrar, #232). */
  private pedirValidacionServirJunto(nuevoModo: number, excluir: LineaVenta[] = []): Observable<ValidarServirJuntoResponse> {
      const lineasPedido = (this.pedido.Lineas || [])
          .filter(l => l.tipoLinea === 1 && l.Producto && l.Cantidad > 0 && !excluir.includes(l))
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
      return this.plantillaVentaService.validarServirJunto(almacen, [], lineasPedido, datosPedido, undefined, nuevoModo);
  }

  /**
   * NestoApp#232 (Nesto#527): si lo que impide salir de «Todo junto» son líneas del pedido (muestras
   * sin stock) que aún se pueden borrar, se ofrece borrarlas; si no, se dice que se queda en «Todo junto».
   */
  private async ofrecerBorrarLineasQueImpiden(nuevoModo: number, response: ValidarServirJuntoResponse): Promise<void> {
      const nombre = nombreModo(nuevoModo);
      const borrables = (this.pedido.Lineas || []).filter(l => l.tipoLinea === 1 && !l.picking);
      const aBorrar = lineasQueImpidenSalirDeTodoJunto(response.ProductosProblematicos, borrables, l => l.Producto);
      const quedarseEnTodoJunto = async (mensaje: string | null) => {
          this.revertirATodoJunto();
          if (mensaje) {
              const alert = await this.alertCtrl.create({ header: 'No se puede cambiar el modo', message: mensaje, buttons: ['Ok'] });
              await alert.present();
          }
      };

      if (!aBorrar) {
          await quedarseEnTodoJunto(conAvisoTodoJunto(response.Mensaje));
          return;
      }

      const pregunta = await this.alertCtrl.create({
          header: 'Modo de servicio',
          message: textoOfrecerQuitarLineas(nombre, aBorrar.map(l => `${(l.Producto ?? '').toString().trim()} ${l.texto || ''}`.trim()), 'borrarlas'),
          buttons: [
              { text: 'No', role: 'cancel' },
              { text: 'Sí, borrarlas', role: 'confirm' }
          ]
      });
      await pregunta.present();
      const { role } = await pregunta.onDidDismiss();
      if (role !== 'confirm') {
          await quedarseEnTodoJunto(textoSeQuedaEnTodoJunto(nombre));
          return;
      }

      const sinEllas = await firstValueFrom(this.pedirValidacionServirJunto(nuevoModo, aBorrar)).catch(() => null);
      if (!sinEllas?.PuedeDesmarcar) {
          await quedarseEnTodoJunto(textoNoSeHanQuitado(nombre, sinEllas?.Mensaje ?? response.Mensaje, true));
          return;
      }
      if (await this.confirmarSalidaDeTodoJunto(sinEllas)) {
          // Como «Borrar línea»: se quitan de la lista y se borran al modificar el pedido.
          this.pedido.Lineas = this.pedido.Lineas.filter(l => !aBorrar.includes(l));
      }
  }

  /** Devuelve false si el vendedor cancela el aviso (y entonces vuelve a «Todo junto»). */
  private async confirmarSalidaDeTodoJunto(response: ValidarServirJuntoResponse): Promise<boolean> {
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
              this.revertirATodoJunto();
              return false;
          }
      }
      return true;
  }

  // ========================================
  // NestoApp#197 / NestoAPI#542: modo de facturación (sustituye al toggle «Mantener junto»).
  // ========================================
  public readonly listaModosFacturacion = LISTA_MODOS_FACTURACION;
  public readonly avisoTodoAhora = AVISO_TODO_AHORA;
  /** Lo último que contestó la API para este pedido (null = sin respuesta: se deja elegir todo). */
  public sugerenciaFacturacion: ModoFacturacionSugerido | null = null;
  /** Solo si el vendedor lo ha cambiado se manda el modo; si no, null (la API nunca lo rechaza). */
  private modoFacturacionTocado = false;
  /** Huella de los campos de los que depende la sugerencia: si no cambian, no se vuelve a pedir. */
  private huellaFacturacion = '';

  get modoFacturacionPedido(): number {
      return modoFacturacionDerivado(this.pedido?.modoFacturacion, !!this.pedido?.mantenerJunto);
  }

  get selectorFacturacionBloqueado(): boolean {
      return selectorFacturacionBloqueado(this.sugerenciaFacturacion);
  }

  public esModoFacturacionPermitido(modo: number): boolean {
      return esModoFacturacionPermitido(this.sugerenciaFacturacion?.Modos, modo);
  }

  get modosFacturacionNoPermitidos(): ModoFacturacionPermitido[] {
      if (this.selectorFacturacionBloqueado) {
          return [];
      }
      return (this.sugerenciaFacturacion?.Modos || []).filter(m => !m.Permitido);
  }

  public cambiarModoFacturacion(nuevo: number): void {
      if (!this.pedido || !nuevo || nuevo === this.modoFacturacionPedido) {
          return;
      }
      this.pedido.modoFacturacion = nuevo;
      // Siempre coherentes: un mantenerJunto discordante gana en la API y pone el 2.
      this.pedido.mantenerJunto = nuevo === MODOS_FACTURACION.AL_COMPLETAR;
      this.modoFacturacionTocado = true;
      // NestoApp#242: la casilla «Servir lo pendiente…» depende del modo de facturación; solo con la API nueva.
      if (this.opcionesModos) {
          this.pedirModoFacturacionSugerido(true);
      }
  }

  // ---- NestoApp#242 / NestoAPI#688: opciones de modos y «Servir lo pendiente en cuanto haya stock» ----

  /** Lo último que contestó OpcionesModos; null con una API anterior (entonces todo como siempre). */
  public opcionesModos: OpcionesModosPedido | null = null;
  private servirPendienteTocado = false;
  public readonly textoServirPendiente = TEXTO_SERVIR_PENDIENTE_AL_HABER_STOCK;

  /** Con «Todo junto» la API oculta el selector de facturación (se queda lo que pongan las condiciones del cliente). */
  get facturacionVisible(): boolean {
      return facturacionVisible(this.opcionesModos);
  }

  get motivoFacturacionOculta(): string {
      return this.facturacionVisible ? '' : (this.opcionesModos?.Facturacion?.MotivoOculta || '');
  }

  get casillaServirPendienteVisible(): boolean {
      return casillaServirPendienteVisible(this.opcionesModos);
  }

  public cambiarServirPendiente(valor: boolean): void {
      if (!this.pedido) {
          return;
      }
      this.pedido.servirPendienteAlHaberStock = !!valor;
      this.servirPendienteTocado = true;
  }

  private aplicarOpcionesModos(opciones: OpcionesModosPedido): void {
      this.opcionesModos = opciones;
      if (!this.servirPendienteTocado && opciones.ServirPendienteAlHaberStock) {
          this.pedido.servirPendienteAlHaberStock = opciones.ServirPendienteAlHaberStock.Valor;
      }
  }

  /**
   * Se pide al cargar, al cambiar la dirección o los plazos y tras un error al guardar. Con el
   * número del pedido, la API contesta con el modo que rige (p. ej. un 3 guardado).
   */
  public pedirModoFacturacionSugerido(forzar: boolean = false): void {
      if (!this.pedido) {
          return;
      }
      const consulta = { ...this.pedido, Lineas: [] };
      const huella = huellaModoFacturacion(consulta);
      if (!forzar && huella === this.huellaFacturacion) {
          return;
      }
      this.huellaFacturacion = huella;
      const aplicarSugerencia = (sugerencia: ModoFacturacionSugerido) => {
          if (!sugerencia || !sugerencia.Modo) {
              return;
          }
          this.sugerenciaFacturacion = sugerencia;
          // Si lo elegido ya no vale (han cambiado los plazos o la forma de pago, #241), se vuelve a lo que propone la API.
          if (this.modoFacturacionTocado && !this.esModoFacturacionPermitido(this.modoFacturacionPedido)) {
              this.pedido.modoFacturacion = sugerencia.Modo;
              this.pedido.mantenerJunto = sugerencia.Modo === MODOS_FACTURACION.AL_COMPLETAR;
              this.modoFacturacionTocado = false;
          }
      };
      // NestoApp#242: OpcionesModos trae la misma sugerencia de facturación más si se enseña y la casilla.
      // Con una API anterior (null) se pregunta como siempre.
      this.plantillaVentaService.opcionesModos(consulta).subscribe((opciones: OpcionesModosPedido | null) => {
          if (opciones) {
              this.aplicarOpcionesModos(opciones);
              aplicarSugerencia(opciones.Facturacion);
              return;
          }
          this.plantillaVentaService.modoFacturacionSugerido(consulta).subscribe(
              aplicarSugerencia,
              error => {
                  // Es una ayuda: sin ella se deja elegir y la API tiene la última palabra al guardar.
                  this.huellaFacturacion = '';
                  console.log('No se ha podido calcular el modo de facturación sugerido', error);
              }
          );
      });
  }

  public cambiarContacto(contacto: string): void {
      if (!this.pedido) {
          return;
      }
      this.pedido.contacto = contacto;
      this.pedirModoFacturacionSugerido();
  }

  /**
   * El pedido tal como se manda al PUT: sin modo de facturación si el vendedor no lo ha tocado (#197) y, con
   * «Todo junto», nunca (#242: el selector está oculto). La casilla solo si se tocó o cambió la facturación
   * (#242). El origen del modo (#250) solo cuando lo ha cambiado el vendedor aquí. La confirmación de fecha
   * lejana (#252) va a false en cada guardado nuevo y a true solo en el reintento tras decir «Sí».
   */
  public pedidoParaGuardar(): any {
      const mandaModoFacturacion = this.modoFacturacionTocado && this.facturacionVisible;
      const pedido: any = {
          ...this.pedido,
          modoFacturacion: mandaModoFacturacion ? this.pedido.modoFacturacion : null,
          servirPendienteAlHaberStock: servirPendienteParaGuardar(this.opcionesModos, !!this.pedido.servirPendienteAlHaberStock,
              this.servirPendienteTocado, this.modoFacturacionTocado),
          ConfirmarFechaEntregaLejana: this.confirmarFechaLejana
      };
      if (this.modoServicioTocado) {
          pedido.OrigenModoServicio = ORIGEN_MODO_SERVICIO.USUARIO;
      }
      return pedido;
  }

  // ---- NestoApp#252 / NestoAPI#712: aviso al grabar con fecha de entrega a más de 60 días ----

  /** true solo en el reintento después de que el vendedor conteste «Sí». */
  private confirmarFechaLejana = false;

  /**
   * Si el error es la pregunta de fecha lejana, la enseña tal cual con «Sí» / «No». Devuelve true si hay que
   * repetir la petición (ya con la confirmación), false si el vendedor dijo «No» (no se graba, sin más
   * errores) y null si el error era otro.
   */
  private async preguntarFechaLejana(error: any): Promise<boolean | null> {
      const aviso = leerFechaEntregaLejana(error);
      if (!aviso) {
          return null;
      }
      const seguir = await this.confirmar('Fecha de entrega', aviso.mensaje, 'Sí');
      this.confirmarFechaLejana = seguir;
      return seguir;
  }

  /** En una nota de entrega automática, abre el pedido del que sale. */
  public abrirPedidoOrigen(): void {
      if (!this.pedido?.pedidoOrigen) {
          return;
      }
      this.nav.navigateForward('pedido-venta', { queryParams: { empresa: this.pedido.empresa, numero: this.pedido.pedidoOrigen } });
  }

  // ========================================
  // NestoApp#198 / NestoAPI#519: pasar el pedido a otro cliente.
  // ========================================
  /** El pedido tal como llegó de la API, para saber si hay cambios sin guardar. */
  private huellaGuardada: string | null = null;
  /** Lo que se rellena solo al cargar (IVA de las líneas) no cuenta como cambio del vendedor. */
  private static readonly NO_CUENTAN_COMO_CAMBIO = ['parametrosIva', 'PorcentajeIva', 'PorcentajeRecargoEquivalencia'];

  private huellaPedido(): string {
      return JSON.stringify(this.pedido, (clave, valor) =>
          PedidoVentaComponent.NO_CUENTAN_COMO_CAMBIO.includes(clave) ? undefined : valor);
  }

  public hayCambiosSinGuardar(): boolean {
      return !!this.pedido && this.huellaGuardada !== null && this.huellaPedido() !== this.huellaGuardada;
  }

  get puedeCambiarCliente(): boolean {
      return puedeCambiarClientePedido(this.pedido);
  }

  public async cambiarCliente(): Promise<void> {
      if (!this.puedeCambiarCliente) {
          return;
      }
      const modal = await this.modalCtrl.create({ component: ModalElegirClienteComponent });
      await modal.present();
      const { data, role } = await modal.onDidDismiss();
      if (role !== 'elegido' || !data?.cliente) {
          return;
      }
      const cliente = data.cliente.toString().trim();
      const contacto = (data.contacto ?? '').toString().trim();
      if (cliente === (this.pedido.cliente || '').trim() && contacto === (this.pedido.contacto || '').trim()) {
          await this.avisar('Cambiar cliente', 'El pedido ya es de ese cliente.');
          return;
      }
      const perdida = this.hayCambiosSinGuardar()
          ? ' Tienes cambios sin guardar en el pedido: se perderán, porque se cambia el pedido tal como está guardado.'
          : '';
      const nombre = data.nombre ? ` (${data.nombre.toString().trim()})` : '';
      const confirmado = await this.confirmar('Cambiar cliente',
          `¿Pasar el pedido ${this.pedido.numero} al cliente ${cliente}/${contacto}${nombre}? Se recalculan las condiciones de pago, los precios y los portes.${perdida}`,
          'Cambiar');
      if (confirmado) {
          await this.enviarCambioCliente(cliente, contacto, false);
      }
  }

  public async enviarCambioCliente(cliente: string, contacto: string, sinValidar: boolean): Promise<void> {
      const loading: any = await this.loadingCtrl.create({ message: 'Cambiando el cliente...' });
      await loading.present();
      const empresa = this.pedido.empresa;
      const numero = this.pedido.numero;
      return new Promise<void>(resolve => {
          this.servicio.cambiarCliente(empresa, numero, {
              Cliente: cliente,
              Contacto: contacto,
              Usuario: Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre,
              CreadoSinPasarValidacion: sinValidar
          }).subscribe({
              next: async (respuesta: CambiarClientePedidoRespuesta) => {
                  await loading.dismiss();
                  this.firebaseAnalytics.logEvent('pedido_venta_cambiar_cliente', { pedido: numero });
                  // Han cambiado cabecera, precios y quizá portes: se recarga lo que ha guardado la API.
                  this.cargarPedido(empresa, numero);
                  const alert = await this.alertCtrl.create({
                      header: 'Cliente cambiado',
                      message: new IonicSafeString(mensajeCambiosCliente(respuesta)),
                      cssClass: 'alerta-cambios-cliente',
                      buttons: ['Ok']
                  });
                  await alert.present();
                  resolve();
              },
              error: async error => {
                  await loading.dismiss();
                  await this.tratarErrorCambioCliente(error, cliente, contacto, sinValidar);
                  resolve();
              }
          });
      });
  }

  private async tratarErrorCambioCliente(error: any, cliente: string, contacto: string, yaSinValidar: boolean): Promise<void> {
      const mensaje = error?.status === 404 || error?.statusCode === 404
          ? 'El pedido ya no existe.'
          : this.errorHandler.extractErrorMessage(error);
      // Como en el PUT: con el cliente nuevo no pasa la validación (ofertas/descuentos). Quien tiene
      // permiso puede seguir sin validar.
      if (error?.apiError?.error?.code === ApiErrorCode.PEDIDO_VALIDACION_FALLO &&
          this.usuario.permitirCrearPedidoConErroresValidacion && !yaSinValidar) {
          const seguir = await this.confirmar('Error de Validación', mensaje + '\n\n¿Desea cambiar el cliente de todas formas?', 'Cambiar sin validar');
          if (seguir) {
              await this.enviarCambioCliente(cliente, contacto, true);
          }
          return;
      }
      await this.avisar('No se ha podido cambiar el cliente', mensaje);
  }

  private async avisar(header: string, message: string): Promise<void> {
      const alert = await this.alertCtrl.create({ header, message, buttons: ['Ok'] });
      await alert.present();
  }

  private confirmar(header: string, message: string, textoSi: string): Promise<boolean> {
      return new Promise<boolean>(async resolve => {
          const alert = await this.alertCtrl.create({
              header,
              message,
              buttons: [
                  { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
                  { text: textoSi, handler: () => resolve(true) }
              ]
          });
          await alert.present();
      });
  }

  public seleccionarFormaPago(evento: any): void {
      this.firebaseAnalytics.logEvent("pedido_seleccionar_forma_pago", {pedido:this.pedido.numero, formaPago: evento});
      this.pedido.formaPago = evento;
      this.pedirModoFacturacionSugerido(); // NestoApp#241: al contado «Al completar» deja de valer
  }

  /** NestoApp#241: con recibo bancario, cambiar la cuenta también vuelve a pedir el modo de facturación. */
  public cambiarCcc(ccc: string): void {
      if (!this.pedido) {
          return;
      }
      this.pedido.ccc = ccc;
      this.pedirModoFacturacionSugerido();
  }

  public seleccionarPlazosPago(evento: any): void {
    this.firebaseAnalytics.logEvent("pedido_seleccionar_plazos_pago", {pedido:this.pedido.numero, plazosPago: evento});
    this.pedido.plazosPago = evento.plazoPago;
    this.pedido.DescuentoPP = evento.descuentoPP;
    this.pedirModoFacturacionSugerido();
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
      const linea: LineaVenta = new LineaVenta();
      linea.copiarDatosPedido(this.pedido);
      linea.Usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      this.abrirLinea(linea);
      this.pedido.Lineas = this.pedido.Lineas.concat(linea);
  }

  public async borrarLinea(linea: LineaVenta) {
      const confirm = await this.alertCtrl.create({
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
      this.confirmarFechaLejana = false; // NestoApp#252: cada guardado nuevo vuelve a preguntar
      const confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Está seguro que quiere modificar el pedido?',
          buttons: [
              {
                  text: 'Sí',
                  handler: () => { this.enviarModificacion(false); }
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


  /** El PUT de «Modificar» (y su reintento tras confirmar la fecha lejana, #252). */
  public async enviarModificacion(forzado: boolean): Promise<void> {
      const loading: any = await this.loadingCtrl.create({
          message: forzado ? 'Modificando Pedido (sin validar)...' : 'Modificando Pedido...',
      });
      await loading.present();

      this.servicio.modificarPedido(this.pedidoParaGuardar(), forzado).subscribe(
          async data => {
              this.firebaseAnalytics.logEvent(forzado ? "modificar_pedido_venta_forzado" : "modificar_pedido_venta", {pedido: this.pedido.numero});
              // Sincronizar la etiqueta de recogida según el checkbox, igual que
              // plantilla-venta crea la etiqueta tras crear el pedido.
              await this.sincronizarRecogerProducto();
              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
              const alert = await this.alertCtrl.create({
                  header: 'Modificado',
                  message: 'Pedido modificado correctamente',
                  buttons: ['Ok'],
              });
              await alert.present();
              await loading.dismiss();
          },
          async error => {
              await loading.dismiss();
              await this.manejarErrorModificacionPedido(error, forzado);
          },
          () => {
              //loading.dismiss();
          }
      );
  }

  public async aceptarPresupuesto(): Promise<void> {

      const confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea aceptar el presupuesto?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      // Hay que guardar el pedido original en alguna parte
                      const loading: any = await this.loadingCtrl.create({
                          message: 'Aceptando presupuesto...',
                      });
                      this.firebaseAnalytics.logEvent("pedido_venta_aceptar_presupuesto", {pedido: this.pedido.numero});
                      await loading.present();

                      this.pedido.EsPresupuesto = false;
                      this.servicio.modificarPedido(this.pedidoParaGuardar()).subscribe(
                          async data => {
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              const alert = await this.alertCtrl.create({
                                  header: 'Aceptado',
                                  message: 'Presupuesto aceptado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                              const mensaje = this.errorHandler.extractErrorMessage(error);
                              const alert = await this.alertCtrl.create({
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

                      this.servicio.modificarPedido(this.pedidoParaGuardar()).subscribe(
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
              const alert = await this.alertCtrl.create({
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
  // - marcado y sin etiqueta previa -> crea etiqueta pendiente (Agencia=0, Retorno=1)
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

      // Issue #165 (réplica de Nesto#427): borrar la etiqueta de recogida pendiente pierde en
      // silencio la dirección/reembolso personalizados de etiquetas creadas a mano en Agencias
      // (al remarcar se crea otra con datos por defecto). Confirmar antes de borrar; si el
      // usuario cancela, dejar la casilla como estaba (marcada) y no tocar el backend.
      if (debeCancelar) {
          const confirmado = await this.confirmarBorradoEtiquetaRecogida();
          if (!confirmado) {
              this.recogerProducto = true;
              return;
          }
      }

      const peticion = debeCrear
          ? this.servicio.crearEtiquetaPendiente(this.pedido.empresa, this.pedido.numero, AGENCIA_LA_ELIGE_EL_COMPARADOR, 1)
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
                  // Issue #165: el 409 al crear (ya existe etiqueta pendiente) llega sin cuerpo,
                  // así que extractErrorMessage no da nada útil. Mensaje explícito.
                  const mensaje = (debeCrear && error?.status === 409)
                      ? 'Ya existe una etiqueta pendiente para este pedido'
                      : this.errorHandler.extractErrorMessage(error);
                  const alert = await this.alertCtrl.create({
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

  /**
   * Issue #165: confirmación antes de borrar la etiqueta de recogida pendiente. Devuelve true si
   * el usuario acepta borrarla, false si cancela.
   */
  private confirmarBorradoEtiquetaRecogida(): Promise<boolean> {
      return new Promise<boolean>(async (resolve) => {
          const confirm = await this.alertCtrl.create({
              header: 'Borrar etiqueta de recogida',
              message: 'Se va a borrar la etiqueta de recogida pendiente de este pedido. Si tenía dirección o reembolso personalizados, se perderán. ¿Continuar?',
              buttons: [
                  { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
                  { text: 'Borrar', role: 'confirm', handler: () => resolve(true) }
              ]
          });
          await confirm.present();
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
          case 5: return 'Cerrado a mano'; // NestoAPI#676: incidentado que la agencia nunca cerró
          default: return 'Desconocido';
      }
  }

  public colorEstadoEnvio(estado: number): string {
      switch (estado) {
          case 2: return 'success';    // Entregado
          case 3: return 'danger';     // Incidentado
          case 4: return 'warning';    // Devuelto
          case 1: return 'primary';    // Tramitado
          default: return 'medium';    // Pendiente / En curso / Cerrado a mano / Desconocido
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
              const alert = await this.alertCtrl.create({
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
      // NestoApp#252 / NestoAPI#712: la fecha de entrega va a más de 60 días: se pregunta y, con «Sí», se repite.
      const fechaLejana = await this.preguntarFechaLejana(error);
      if (fechaLejana === true) {
          await this.enviarModificacion(yaForzado);
          return;
      }
      if (fechaLejana === false) {
          return;
      }
      // NestoApp#197: el 400 de modo de facturación no permitido es texto plano (sin código); se enseña
      // como cualquier error y se vuelve a pedir la sugerencia para que el selector diga qué vale.
      this.pedirModoFacturacionSugerido(true);
      // NestoApp#187 / NestoAPI#518: el PUT que cambia el modo lo rechaza si ya no tiene sentido
      // para el pedido. Se preselecciona el que vale y el vendedor vuelve a guardar.
      // NestoApp#191 / NestoAPI#533: con picking el modo ya no se cambia desde aquí. Se vuelve al
      // guardado (para poder guardar el resto de cambios) y se ofrece pedírselo a almacén.
      const motivoPicking = leerModoConPicking(error);
      if (motivoPicking) {
          const modoDeseado = this.modoServicioPedido;
          if (this.modoServicioGuardado !== null) {
              this.pedido.modoServicio = this.modoServicioGuardado;
              this.pedido.servirJunto = esTodoJunto(this.modoServicioGuardado);
          }
          await this.solicitudCambioModo.ofrecer(motivoPicking, this.pedido.empresa, this.pedido.numero, modoDeseado);
          return;
      }

      const rechazoModo = leerModoServicioNoPermitido(error);
      if (rechazoModo) {
          this.pedido.modoServicio = rechazoModo.modoSugerido;
          this.pedido.servirJunto = esTodoJunto(rechazoModo.modoSugerido);
          const alert = await this.alertCtrl.create({
              header: 'Modo de entrega',
              message: rechazoModo.mensaje,
              buttons: ['Ok']
          });
          await alert.present();
          return;
      }

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
                          this.enviarModificacion(true);
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
