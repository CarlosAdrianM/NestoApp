import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Usuario } from 'src/app/models/Usuario';
import { AutorizacionesPedidoService } from 'src/app/services/autorizaciones-pedido.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import {
  AYUDA_AUTORIZADOR, AYUDA_SOLICITANTE, AutorizacionPedido, ESTADO_DENEGADA, LONGITUD_MAXIMA_TEXTO_AUTORIZACION, LineaAutorizacionPedido,
  TITULO_ANULAR_AUTORIZACION, TITULO_AUTORIZAR, TITULO_DENEGAR, colorEstadoAutorizacion, esDelUsuario, estaPendiente, falloTextoAutorizacion,
  lineasDesdeBorrador, mensajeErrorAutorizacion, resumenAutorizaciones, textoClienteAutorizacion, textoMotivos, textoResolucion, textoSolicitante
} from 'src/app/models/autorizacion-pedido.model';

/**
 * NestoApp#280 / #290 punto 5 (Novedades 1258, gemela de Nesto «Autorizaciones de pedidos»). Quien no puede crear un pedido
 * sin pasar la validación de ofertas y descuentos lo pide desde la plantilla; aquí ve sus solicitudes (pendientes; con «Ver
 * también las resueltas», todas) y puede anularlas. Quien puede autorizar (el mismo criterio del «crear sin validar») ve
 * también las de los demás y puede «Autorizar y crear el pedido» o «Denegar». Quién ve y hace qué lo decide al final la API.
 * La abren el menú y la push AutorizacionPedidoResuelta (`?id=`). Textos de usted.
 */
@Component({
  selector: 'app-autorizaciones-pedido',
  templateUrl: './autorizaciones-pedido.component.html',
  styleUrls: ['./autorizaciones-pedido.component.scss'],
  standalone: false
})
export class AutorizacionesPedidoComponent {
  public solicitudes: AutorizacionPedido[] = [];
  public cargando = false;
  public ocupado = false;
  public mensaje = '';
  public verResueltas = false;

  /** La solicitud desplegada (con sus líneas) y lo que se sabe de ella. */
  public abierta: number | null = null;
  public lineas: LineaAutorizacionPedido[] = [];
  public cargandoLineas = false;
  public mensajeLineas = '';

  private idAElegir: number | null = null;
  private avisarResolucionAlElegir = false;

  public readonly estaPendiente = estaPendiente;
  public readonly colorEstado = colorEstadoAutorizacion;
  public readonly textoCliente = textoClienteAutorizacion;
  public readonly textoSolicitante = textoSolicitante;
  public readonly textoMotivos = textoMotivos;
  public readonly textoResolucion = textoResolucion;

  constructor(
    private route: ActivatedRoute,
    private servicio: AutorizacionesPedidoService,
    private usuario: Usuario,
    private nav: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firebaseAnalytics: FirebaseAnalytics
  ) {
    // Por queryParams: dos pushes seguidas de solicitudes distintas reutilizan la página.
    this.route.queryParams.subscribe(params => {
      const id = Number(params?.id);
      this.idAElegir = Number.isInteger(id) && id > 0 ? id : null;
      this.avisarResolucionAlElegir = this.idAElegir != null;
      this.cargar();
    });
  }

  /** El mismo criterio que «crear sin validar» de la plantilla; lo que no le toque, la API lo rechaza (403). */
  get puedeAutorizar(): boolean {
    return !!this.usuario?.permitirCrearPedidoConErroresValidacion;
  }

  get ayuda(): string {
    return this.puedeAutorizar ? AYUDA_AUTORIZADOR : AYUDA_SOLICITANTE;
  }

  get resumen(): string {
    return resumenAutorizaciones(this.solicitudes, this.verResueltas);
  }

  public esSuya(solicitud: AutorizacionPedido): boolean {
    return esDelUsuario(solicitud, this.usuario?.nombre);
  }

  public puedeAutorizarEsta(solicitud: AutorizacionPedido): boolean {
    return this.puedeAutorizar && estaPendiente(solicitud);
  }

  /** El solicitante, mientras siga pendiente (quien no autoriza solo ve las suyas). */
  public puedeAnular(solicitud: AutorizacionPedido): boolean {
    return estaPendiente(solicitud) && (!this.puedeAutorizar || this.esSuya(solicitud));
  }

  public cambiarVerResueltas(valor: boolean): void {
    this.verResueltas = !!valor;
    this.cargar();
  }

  public async cargar(evento?: any): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    try {
      let lista = await firstValueFrom(this.servicio.leer(!this.verResueltas, !this.puedeAutorizar));
      if (this.idAElegir != null && !this.verResueltas && !lista.some(s => s.Id === this.idAElegir)) {
        // La de la push ya no está pendiente (contestada o anulada): se enseña con las resueltas
        this.verResueltas = true;
        lista = await firstValueFrom(this.servicio.leer(false, !this.puedeAutorizar));
      }
      this.poner(lista);
      const elegida = this.idAElegir != null ? this.solicitudes.find(s => s.Id === this.idAElegir) : null;
      if (this.idAElegir != null && !elegida) {
        this.mensaje = `La solicitud ${this.idAElegir} ya no está en la lista.`;
      } else if (elegida) {
        this.abrir(elegida, true);
        if (this.avisarResolucionAlElegir && elegida.Estado === ESTADO_DENEGADA) {
          await this.avisar('Autorización denegada',
            `Su solicitud de autorización del pedido de ${textoClienteAutorizacion(elegida)}: ${textoResolucion(elegida)}`);
        }
      }
    } catch (error) {
      this.solicitudes = [];
      this.mensaje = mensajeErrorAutorizacion(error);
    } finally {
      this.idAElegir = null;
      this.avisarResolucionAlElegir = false;
      this.cargando = false;
      evento?.target?.complete?.();
    }
  }

  private poner(lista: AutorizacionPedido[]): void {
    this.solicitudes = (lista || []).filter(s => !!s && (this.verResueltas || estaPendiente(s)));
    if (this.abierta != null && !this.solicitudes.some(s => s.Id === this.abierta)) {
      this.abierta = null;
      this.lineas = [];
    }
  }

  /** Despliega (o pliega) una solicitud y lee su pedido con las líneas marcadas. */
  public abrir(solicitud: AutorizacionPedido, forzar: boolean = false): void {
    if (this.abierta === solicitud.Id && !forzar) {
      this.abierta = null;
      this.lineas = [];
      return;
    }
    this.abierta = solicitud.Id;
    this.lineas = [];
    this.mensajeLineas = '';
    this.cargandoLineas = true;
    this.servicio.leerUna(solicitud.Id).subscribe({
      next: detalle => {
        if (this.abierta !== solicitud.Id) {
          return;
        }
        this.cargandoLineas = false;
        this.lineas = lineasDesdeBorrador(detalle?.Pedido, detalle?.Errores ?? solicitud.Errores);
      },
      error: error => {
        if (this.abierta !== solicitud.Id) {
          return;
        }
        this.cargandoLineas = false;
        this.mensajeLineas = mensajeErrorAutorizacion(error);
      }
    });
  }

  public abrirPedidoCreado(solicitud: AutorizacionPedido): void {
    if ((solicitud?.PedidoCreado || 0) > 0) {
      this.abrirPedido(solicitud.Empresa, solicitud.PedidoCreado);
    }
  }

  private abrirPedido(empresa: string | null | undefined, numero: number): void {
    this.nav.navigateForward('pedido-venta', {
      queryParams: { empresa: (empresa || '').toString().trim() || Configuracion.EMPRESA_POR_DEFECTO, numero }
    });
  }

  public async autorizar(solicitud: AutorizacionPedido): Promise<void> {
    const comentario = await this.pedirTexto(TITULO_AUTORIZAR,
      `Se creará el pedido de ${textoClienteAutorizacion(solicitud)} tal cual lo mandó ${textoSolicitante(solicitud)}. `
      + 'Si quiere, escriba un comentario (puede dejarlo en blanco).', 'Comentario (opcional)', false, 'Autorizar');
    if (comentario == null) {
      return;
    }
    await this.enviarAutorizacion(solicitud, comentario);
  }

  public async enviarAutorizacion(solicitud: AutorizacionPedido, comentario: string): Promise<void> {
    this.ocupado = true;
    const loading = await this.loadingCtrl.create({ message: 'Creando el pedido...' });
    await loading.present();
    let pedido: number | null = null;
    let bien = false;
    try {
      const resultado = await firstValueFrom(this.servicio.autorizar(solicitud.Id, comentario));
      bien = true;
      pedido = (resultado?.Pedido || 0) > 0 ? resultado.Pedido : null;
      this.firebaseAnalytics.logEvent('autorizacion_pedido_autorizar', { id: solicitud.Id, pedido });
    } catch (error) {
      await loading.dismiss();
      await this.avisar('No se ha podido autorizar', mensajeErrorAutorizacion(error));
    }
    this.ocupado = false;
    await loading.dismiss().catch(() => { });
    await this.cargar();
    if (!bien) {
      return;
    }
    if (pedido) {
      const alert = await this.alertCtrl.create({
        header: TITULO_AUTORIZAR,
        message: `Autorizada: se ha creado el pedido ${pedido}. ¿Desea abrirlo?`,
        buttons: [
          { text: 'No', role: 'cancel' },
          { text: 'Abrir el pedido', handler: () => { this.abrirPedido(solicitud.Empresa, pedido); } }
        ]
      });
      await alert.present();
    } else {
      await this.avisar(TITULO_AUTORIZAR, 'Autorizada: se ha creado el pedido.');
    }
  }

  public async denegar(solicitud: AutorizacionPedido): Promise<void> {
    const motivo = await this.pedirTexto(TITULO_DENEGAR,
      `¿Por qué deniega la autorización del pedido de ${textoClienteAutorizacion(solicitud)}? Le llegará a ${textoSolicitante(solicitud)}.`,
      'Motivo', true, 'Denegar');
    if (motivo == null) {
      return;
    }
    await this.ejecutar(() => firstValueFrom(this.servicio.denegar(solicitud.Id, motivo)), 'Autorización denegada.', 'No se ha podido denegar',
      'autorizacion_pedido_denegar', solicitud.Id);
  }

  public async anular(solicitud: AutorizacionPedido): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: TITULO_ANULAR_AUTORIZACION,
      message: `¿Desea anular su solicitud de autorización del pedido de ${textoClienteAutorizacion(solicitud)}?`,
      buttons: [
        { text: 'No', role: 'cancel' },
        { text: 'Anular', handler: () => { this.enviarAnulacion(solicitud); } }
      ]
    });
    await alert.present();
  }

  public enviarAnulacion(solicitud: AutorizacionPedido): Promise<void> {
    return this.ejecutar(() => firstValueFrom(this.servicio.anular(solicitud.Id)), 'Solicitud anulada.', 'No se ha podido anular',
      'autorizacion_pedido_anular', solicitud.Id);
  }

  public async ejecutar(accion: () => Promise<any>, hecho: string, queFallo: string, evento: string, id: number): Promise<void> {
    this.ocupado = true;
    let bien = false;
    try {
      await accion();
      bien = true;
      this.firebaseAnalytics.logEvent(evento, { id });
    } catch (error) {
      await this.avisar(queFallo, mensajeErrorAutorizacion(error));
    }
    this.ocupado = false;
    await this.cargar();
    if (bien) {
      const toast = await this.toastCtrl.create({ message: hecho, duration: 2500, color: 'success' });
      await toast.present();
    }
  }

  /** Pide un texto (null si cancela). Obligatorio: vacío no vale. Más de 500, tampoco (el diálogo no se cierra). */
  private pedirTexto(titulo: string, pregunta: string, placeholder: string, obligatorio: boolean, textoBoton: string): Promise<string | null> {
    return new Promise<string | null>(async resolve => {
      const alert = await this.alertCtrl.create({
        header: titulo,
        message: pregunta,
        backdropDismiss: false,
        inputs: [{ name: 'texto', type: 'textarea', placeholder, attributes: { maxlength: LONGITUD_MAXIMA_TEXTO_AUTORIZACION } }],
        buttons: [
          { text: 'Cancelar', role: 'cancel', handler: () => resolve(null) },
          {
            text: textoBoton,
            handler: (datos: any) => {
              const fallo = falloTextoAutorizacion(datos?.texto, obligatorio);
              if (fallo) {
                this.toastCtrl.create({ message: fallo, duration: 2500, color: 'warning' }).then(t => t.present());
                return false;
              }
              resolve((datos?.texto || '').toString().trim());
              return true;
            }
          }
        ]
      });
      await alert.present();
    });
  }

  private async avisar(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['Ok'] });
    await alert.present();
  }
}
