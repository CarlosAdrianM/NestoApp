import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { EnviosAgenciasService } from 'src/app/services/envios-agencias.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { DecisionReenvio, EnvioDevuelto, ReenviarEnvio, estaDecidido, textoDecisionEnvio, textoEstadoEnvioDevuelto, textoResultadoDecision } from 'src/app/models/envio-devuelto.model';

/**
 * NestoApp#267 (NestoAPI#699, corte 2): la agencia ha devuelto un envío (o lo tiene en incidencia) y hay que decir si el
 * cliente lo sigue queriendo. Lo abre la push «DevolucionEnvioAgencia» (y la lista de Devueltos): datos del envío, la
 * dirección y los teléfonos editables, «Sí, volver a enviar» (sin cobrar portes salvo que se marque) y «No, abonar».
 * Si ya está decidido (o la API contesta 409), se enseña quién y cuándo. Textos de usted.
 */
@Component({
  selector: 'app-envio-devuelto',
  templateUrl: './envio-devuelto.component.html',
  styleUrls: ['./envio-devuelto.component.scss'],
  standalone: false
})
export class EnvioDevueltoComponent {
  public envio: EnvioDevuelto | null = null;
  public cargando = false;
  public enviando = false;
  public mensaje = '';
  public datos: ReenviarEnvio = { IncluirPortes: false };
  public readonly textoEstado = textoEstadoEnvioDevuelto;
  private empresa = '1';
  private numero = 0;

  constructor(
    private route: ActivatedRoute,
    private servicio: EnviosAgenciasService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private nav: NavController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) {
    // Por queryParams: dos pushes seguidas de envíos distintos reutilizan la página.
    this.route.queryParams.subscribe(params => {
      const numero = Number(params?.envio);
      if (numero) {
        this.empresa = (params?.empresa || '1').toString().trim() || '1';
        this.numero = numero;
        this.cargar();
      }
    });
  }

  get decidido(): boolean {
    return estaDecidido(this.envio);
  }

  get textoDecision(): string {
    return textoDecisionEnvio(this.envio);
  }

  public cargar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.envio = null;
    this.servicio.leerDevueltos(this.empresa).subscribe({
      next: envios => {
        this.cargando = false;
        const envio = (envios || []).find(e => +e.Numero === +this.numero) || null;
        this.aplicarEnvio(envio);
        if (!envio) {
          this.mensaje = `No se ha encontrado el envío ${this.numero} entre los devueltos de los últimos 60 días.`;
        }
      },
      error: error => {
        this.cargando = false;
        this.mensaje = (error?.status === 404 || error?.statusCode === 404)
          ? 'Los envíos devueltos todavía no están disponibles en el servidor.'
          : 'No se ha podido cargar el envío. Inténtelo otra vez en un rato.';
      }
    });
  }

  /** Para los tests y para refrescar tras decidir. */
  public aplicarEnvio(envio: EnvioDevuelto | null): void {
    this.envio = envio;
    this.datos = {
      Direccion: envio?.Direccion || '',
      CodPostal: envio?.CodPostal || '',
      Poblacion: envio?.Poblacion || '',
      Provincia: envio?.Provincia || '',
      Telefono: envio?.Telefono || '',
      Movil: envio?.Movil || '',
      Observaciones: envio?.Observaciones || '',
      IncluirPortes: false
    };
    if (envio) {
      this.firebaseAnalytics.logEvent('envio_devuelto_abrir', { envio: envio.Numero, decision: envio.Decision });
    }
  }

  public async reenviar(): Promise<void> {
    if (!this.envio || this.enviando) {
      return;
    }
    if (!(this.datos.Direccion || '').trim() || !(this.datos.CodPostal || '').trim()) {
      const alerta = await this.alertCtrl.create({ header: 'Faltan datos', message: 'La dirección y el código postal no pueden quedar vacíos.', buttons: ['Ok'] });
      await alerta.present();
      return;
    }
    await this.decidir('reenviar', () => this.servicio.reenviar(this.envio.Numero, this.limpiar(this.datos)));
  }

  public async abonar(): Promise<void> {
    if (!this.envio || this.enviando) {
      return;
    }
    const confirmar = await this.alertCtrl.create({
      header: '¿Abonar el pedido?',
      message: `Se anota que el cliente NO quiere el envío ${this.envio.Numero}${this.envio.Pedido ? ` del pedido ${this.envio.Pedido}` : ''} y el almacén hará el abono. ¿Confirma?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sí, abonar', handler: () => { this.decidir('abonar', () => this.servicio.abonar(this.envio.Numero)); } }
      ]
    });
    await confirmar.present();
  }

  private limpiar(datos: ReenviarEnvio): ReenviarEnvio {
    const limpio: ReenviarEnvio = { IncluirPortes: !!datos.IncluirPortes };
    for (const campo of ['Direccion', 'CodPostal', 'Poblacion', 'Provincia', 'Telefono', 'Movil', 'Observaciones'] as const) {
      const valor = (datos[campo] || '').toString().trim();
      if (valor) {
        limpio[campo] = valor;
      }
    }
    return limpio;
  }

  private async decidir(accion: 'reenviar' | 'abonar', llamada: () => any): Promise<void> {
    this.enviando = true;
    const loading = await this.loadingCtrl.create({ message: accion === 'reenviar' ? 'Creando el envío nuevo...' : 'Anotando la decisión...' });
    await loading.present();
    try {
      const resultado: DecisionReenvio = await firstValueFrom(llamada());
      await loading.dismiss();
      this.firebaseAnalytics.logEvent('envio_devuelto_' + accion, { envio: this.envio?.Numero });
      const alerta = await this.alertCtrl.create({
        header: accion === 'reenviar' ? 'Se vuelve a enviar' : 'Se abona',
        message: textoResultadoDecision(resultado),
        buttons: ['Entendido']
      });
      await alerta.present();
      await alerta.onDidDismiss();
      this.cargar();
    } catch (error) {
      await loading.dismiss();
      const conflicto = error?.status === 409 || error?.statusCode === 409;
      const alerta = await this.alertCtrl.create({
        header: conflicto ? 'Este envío ya está decidido' : 'No se ha podido anotar la decisión',
        message: this.errorHandler.extractErrorMessage(error),
        buttons: ['Ok']
      });
      await alerta.present();
      if (conflicto) {
        this.cargar();
      }
    } finally {
      this.enviando = false;
    }
  }

  public abrirPedido(): void {
    if (this.envio?.Pedido) {
      this.nav.navigateForward('pedido-venta', { queryParams: { empresa: this.envio.Empresa || this.empresa, numero: this.envio.Pedido } });
    }
  }
}
