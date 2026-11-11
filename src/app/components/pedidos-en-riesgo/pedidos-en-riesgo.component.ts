import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { PedidosEnRiesgoService } from 'src/app/services/pedidos-en-riesgo.service';
import {
  AvisosPromesaRiesgo, PedidoPromesaRiesgo, colorEstadoPromesa, estaResuelto, pedidosEnRiesgoPendientes, textoEstadoPromesa, textoFechasPromesa,
  textoResolucionPromesa
} from 'src/app/models/pedido-promesa-riesgo.model';

/**
 * NestoApp#248 (gemela de NestoAPI#693 y de Nesto#546): los pedidos del vendedor (y de su equipo) cuya fecha de entrega
 * prometida ya no se cumple, de la más próxima a la más lejana, con el motivo. Al tocar uno se abre el pedido, donde se
 * puede cambiar el modo de servir o avisar al cliente. «Ver también los resueltos» añade los de los últimos 30 días. El
 * usuario elige qué avisos recibe. Sin sondeo: se carga al entrar y con el botón de actualizar.
 */
@Component({
  selector: 'app-pedidos-en-riesgo',
  templateUrl: './pedidos-en-riesgo.component.html',
  styleUrls: ['./pedidos-en-riesgo.component.scss'],
  standalone: false
})
export class PedidosEnRiesgoComponent {
  public pedidos: PedidoPromesaRiesgo[] = [];
  public cargando = false;
  public mensaje = '';
  public verResueltos = false;
  /** null si la API no los da (anterior o con error): no se enseña el selector. */
  public avisos: AvisosPromesaRiesgo | null = null;
  public guardandoAvisos = false;

  public readonly textoEstado = textoEstadoPromesa;
  public readonly colorEstado = colorEstadoPromesa;
  public readonly textoFechas = textoFechasPromesa;
  public readonly textoResolucion = textoResolucionPromesa;
  public readonly resuelto = estaResuelto;

  constructor(
    private servicio: PedidosEnRiesgoService,
    private nav: NavController,
    private alertCtrl: AlertController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  ionViewWillEnter(): void {
    this.cargar();
    this.cargarAvisos();
  }

  get pendientes(): number {
    return pedidosEnRiesgoPendientes(this.pedidos);
  }

  public cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.leer(this.verResueltos).subscribe({
      next: pedidos => {
        this.pedidos = pedidos || [];
        this.cargando = false;
        this.firebaseAnalytics.logEvent('pedidos_en_riesgo_abrir', { total: this.pedidos.length, resueltos: this.verResueltos });
      },
      error: error => {
        this.cargando = false;
        this.pedidos = [];
        const estado = error?.status ?? error?.statusCode;
        this.mensaje = estado === 404
          ? 'Los pedidos en riesgo todavía no están disponibles en el servidor.'
          : estado === 403
            ? 'No tiene permiso para ver los pedidos en riesgo.'
            : 'No se han podido cargar los pedidos en riesgo. Inténtelo otra vez en un rato.';
      }
    });
  }

  public cambiarVerResueltos(valor: boolean): void {
    this.verResueltos = !!valor;
    this.cargar();
  }

  public cargarAvisos(): void {
    this.servicio.leerAvisos().subscribe({
      next: avisos => this.avisos = avisos?.Valor ? avisos : null,
      error: () => this.avisos = null
    });
  }

  /** Guarda lo elegido; si falla, se dice y se vuelve a lo que había. */
  public cambiarAvisos(valor: string): void {
    const anterior = this.avisos;
    if (!anterior || !valor || valor === anterior.Valor || this.guardandoAvisos) {
      return;
    }
    this.guardandoAvisos = true;
    this.servicio.guardarAvisos(valor).subscribe({
      next: avisos => {
        this.guardandoAvisos = false;
        this.avisos = avisos?.Valor ? { ...avisos, Opciones: avisos.Opciones?.length ? avisos.Opciones : anterior.Opciones } : { ...anterior, Valor: valor };
        this.firebaseAnalytics.logEvent('pedidos_en_riesgo_avisos', { valor });
      },
      error: async error => {
        this.guardandoAvisos = false;
        this.avisos = { ...anterior };
        const alerta = await this.alertCtrl.create({ header: 'No se ha podido guardar', message: this.errorHandler.extractErrorMessage(error), buttons: ['Ok'] });
        await alerta.present();
      }
    });
  }

  public abrir(pedido: PedidoPromesaRiesgo): void {
    this.nav.navigateForward('pedido-venta', { queryParams: { empresa: pedido.Empresa || '1', numero: pedido.Pedido } });
  }
}
