import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { RecogidasSolicitadasService } from 'src/app/services/recogidas-solicitadas.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import {
  QuienRecoge, RecogidaSolicitada, colorEstadoRecogida, mensajeErrorRecogida, puedeAnularRecogida, recogidasSinResolver,
  solicitudValida, textoEstadoRecogida, textoRecogida, tieneCodigoParaEnsenar
} from 'src/app/models/recogida-solicitada.model';

/**
 * NestoApp#259 / NestoAPI#855 (gemela Nesto#635): las recogidas de un cliente. El vendedor pide una («recoged el aparato X
 * para reparar») y el almacén la confirma o la rechaza en Nesto. La recoge el reparto (solo ruta propia; si no, la API lo dice)
 * o el propio vendedor: entonces, ya confirmada, se enseña el código NR como código de barras para leerlo en Algete.
 * La abre la ficha del cliente y las push RecogidaSolicitadaResuelta / SinRespuesta / Anulada. Textos de usted.
 */
@Component({
  selector: 'app-recogidas',
  templateUrl: './recogidas.component.html',
  styleUrls: ['./recogidas.component.scss'],
  standalone: false
})
export class RecogidasComponent {
  public empresa = Configuracion.EMPRESA_POR_DEFECTO;
  public cliente = '';
  public contacto = '0';
  public nombre = '';

  public recogidas: RecogidaSolicitada[] = [];
  public cargando = false;
  public mensaje = '';
  public enviando = false;

  /** El formulario de una nueva. */
  public nueva = { Texto: '', Bultos: 1, FacturaOriginal: '', QuienRecoge: 'Reparto' as QuienRecoge };
  public mostrarFormulario = false;

  public readonly textoEstado = textoEstadoRecogida;
  public readonly colorEstado = colorEstadoRecogida;
  public readonly textoRecogida = textoRecogida;
  public readonly puedeAnular = puedeAnularRecogida;
  public readonly tieneCodigo = tieneCodigoParaEnsenar;

  constructor(
    private route: ActivatedRoute,
    private servicio: RecogidasSolicitadasService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private firebaseAnalytics: FirebaseAnalytics
  ) {
    // Por queryParams: dos pushes seguidas de clientes distintos reutilizan la página.
    this.route.queryParams.subscribe(params => {
      const cliente = (params?.cliente ?? '').toString().trim();
      if (cliente) {
        this.empresa = (params?.empresa ?? '').toString().trim() || Configuracion.EMPRESA_POR_DEFECTO;
        this.cliente = cliente;
        this.contacto = (params?.contacto ?? '').toString().trim() || '0';
        this.nombre = (params?.nombre ?? '').toString().trim();
        this.mostrarFormulario = false;
        this.cargar();
      }
    });
  }

  /** Mientras haya una sin resolver, la API no deja pedir otra para el contacto (409): se avisa antes. */
  get haySinResolver(): boolean {
    return recogidasSinResolver(this.recogidas).length > 0;
  }

  get titulo(): string {
    const nombre = this.nombre || this.recogidas.find(r => !!r.NombreCliente)?.NombreCliente || '';
    return `${this.cliente}/${this.contacto}${nombre ? ' · ' + nombre : ''}`;
  }

  public cargar(evento?: any): void {
    this.cargando = true;
    this.mensaje = '';
    this.servicio.leer(this.empresa, this.cliente, this.contacto).subscribe({
      next: lista => {
        this.recogidas = lista;
        this.cargando = false;
        evento?.target?.complete?.();
      },
      error: error => {
        this.recogidas = [];
        this.cargando = false;
        this.mensaje = mensajeErrorRecogida(error);
        evento?.target?.complete?.();
      }
    });
  }

  public abrirFormulario(): void {
    this.nueva = { Texto: '', Bultos: 1, FacturaOriginal: '', QuienRecoge: 'Reparto' };
    this.mostrarFormulario = true;
  }

  public async solicitar(): Promise<void> {
    const solicitud = {
      Empresa: this.empresa, Cliente: this.cliente, Contacto: this.contacto,
      Texto: this.nueva.Texto, Bultos: Number(this.nueva.Bultos), FacturaOriginal: this.nueva.FacturaOriginal, QuienRecoge: this.nueva.QuienRecoge
    };
    const fallo = solicitudValida(solicitud);
    if (fallo) {
      await this.avisar('Solicitar recogida', fallo);
      return;
    }
    this.enviando = true;
    const loading = await this.loadingCtrl.create({ message: 'Solicitando la recogida...' });
    await loading.present();
    this.servicio.solicitar(solicitud).subscribe({
      next: async () => {
        this.enviando = false;
        await loading.dismiss();
        this.firebaseAnalytics.logEvent('recogida_solicitar', { cliente: this.cliente, quien: solicitud.QuienRecoge });
        this.mostrarFormulario = false;
        this.cargar();
        const toast = await this.toastCtrl.create({
          message: 'Recogida solicitada. Le avisaremos cuando el almacén la confirme.', duration: 3500, color: 'success'
        });
        await toast.present();
      },
      error: async error => {
        this.enviando = false;
        await loading.dismiss();
        await this.avisar('No se ha podido solicitar la recogida', mensajeErrorRecogida(error));
      }
    });
  }

  public async anular(recogida: RecogidaSolicitada): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Anular la recogida',
      message: '¿Anular esta solicitud de recogida? El almacén ya no la hará.',
      inputs: [{ name: 'motivo', type: 'text', placeholder: 'Motivo (opcional)', attributes: { maxlength: 300 } }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Anular', handler: (datos: any) => { this.enviarAnulacion(recogida, datos?.motivo); } }
      ]
    });
    await alert.present();
  }

  public enviarAnulacion(recogida: RecogidaSolicitada, motivo?: string): void {
    this.servicio.anular(recogida.Id, motivo).subscribe({
      next: async () => {
        this.firebaseAnalytics.logEvent('recogida_anular', { id: recogida.Id });
        this.cargar();
        const toast = await this.toastCtrl.create({ message: 'Recogida anulada.', duration: 2500, color: 'success' });
        await toast.present();
      },
      error: async error => {
        await this.avisar('No se ha podido anular', mensajeErrorRecogida(error));
        this.cargar();
      }
    });
  }

  private async avisar(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['Ok'] });
    await alert.present();
  }
}
