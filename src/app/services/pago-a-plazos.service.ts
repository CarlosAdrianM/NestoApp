import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import {
  CanalPagoAPlazos, DisponibilidadPagoAPlazos, EstadoPagoAPlazos, SolicitudPagoAPlazos, textoMensajeParaCliente
} from '../models/pago-a-plazos.model';
import { ErrorHandlerService } from './error-handler.service';
import { EnvioWhatsAppService } from './envio-whatsapp.service';
import { FirebaseAnalytics } from './firebase-analytics.service';

/**
 * NestoApp#281 / NestoAPI#864: pagar a plazos un pedido ya creado. Las llamadas y el diálogo entero (app del cliente o enlace,
 * y compartir el enlace), para usarlo igual desde el pedido y al terminar un pedido en la plantilla. Textos de usted.
 */
@Injectable({
  providedIn: 'root'
})
export class PagoAPlazosService {
  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService,
    private whatsApp: EnvioWhatsAppService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  private url(empresa: string, pedido: number | string): string {
    return `${Configuracion.API_URL}/PedidosVenta/${encodeURIComponent((empresa || '1').toString().trim())}/${(pedido ?? '').toString().trim()}/PagoAPlazos`;
  }

  /** Siempre 200 en la API; null si falla (503 sin script, API anterior, sin conexión) o tarda más del tope. */
  public disponible(empresa: string, pedido: number | string, topeMs: number = 8000): Observable<DisponibilidadPagoAPlazos | null> {
    return this.http.get<DisponibilidadPagoAPlazos>(`${this.url(empresa, pedido)}/Disponible`).pipe(
      timeout(topeMs),
      catchError(() => of(null))
    );
  }

  /** null si falla: el pedido se enseña igual. */
  public estado(empresa: string, pedido: number | string): Observable<EstadoPagoAPlazos | null> {
    return this.http.get<EstadoPagoAPlazos>(`${this.url(empresa, pedido)}/Estado`).pipe(catchError(() => of(null)));
  }

  public solicitar(empresa: string, pedido: number | string, canal: CanalPagoAPlazos, correo: string | null = null): Observable<SolicitudPagoAPlazos> {
    return this.http.post<SolicitudPagoAPlazos>(this.url(empresa, pedido), { Canal: canal, Correo: correo });
  }

  public cancelar(empresa: string, pedido: number | string, motivo?: string | null): Observable<EstadoPagoAPlazos> {
    let params = new HttpParams();
    if ((motivo || '').trim()) {
      params = params.set('motivo', motivo.trim());
    }
    return this.http.delete<EstadoPagoAPlazos>(this.url(empresa, pedido), { params });
  }

  /**
   * El diálogo completo: pregunta por dónde (aviso a la app del cliente, si la tiene, o enlace), lo pide a la API y, si hay
   * enlace, deja mandarlo por WhatsApp o copiarlo. Devuelve true si se ha pedido.
   */
  public async ofrecer(empresa: string, pedido: number | string, disponibilidad?: DisponibilidadPagoAPlazos | null): Promise<boolean> {
    let datos = disponibilidad;
    if (!datos) {
      const loading = await this.loadingCtrl.create({ message: 'Comprobando el pago a plazos...' });
      await loading.present();
      datos = await firstValueFrom(this.disponible(empresa, pedido));
      await loading.dismiss();
    }
    const proveedor = (datos?.NombreProveedor || datos?.Proveedor || 'pago a plazos').toString().trim();
    if (!datos?.Disponible) {
      await this.avisar('Pagar a plazos', (datos?.Motivo || '').trim() || 'El pago a plazos no está disponible para este pedido.');
      return false;
    }
    const canal = await this.elegirCanal(proveedor, datos);
    if (!canal) {
      return false;
    }
    const loading = await this.loadingCtrl.create({ message: `Pidiendo el pago con ${proveedor}...` });
    await loading.present();
    let respuesta: SolicitudPagoAPlazos;
    try {
      respuesta = await firstValueFrom(this.solicitar(empresa, pedido, canal));
    } catch (error) {
      await loading.dismiss();
      await this.avisar('No se ha podido pedir el pago a plazos', this.errorHandler.extractErrorMessage(error));
      return false;
    }
    await loading.dismiss();
    this.firebaseAnalytics.logEvent('pago_a_plazos_solicitar', { pedido: (pedido ?? '').toString(), canal });
    await this.ensenarResultado(proveedor, canal, respuesta);
    return true;
  }

  /** Cancelar la solicitud viva, con confirmación. Devuelve true si se ha cancelado. */
  public async preguntarCancelar(empresa: string, pedido: number | string, proveedor: string): Promise<boolean> {
    const confirmado = await new Promise<boolean>(async resolve => {
      const alert = await this.alertCtrl.create({
        header: 'Cancelar el pago a plazos',
        message: `¿Cancelar la solicitud de ${proveedor} de este pedido? Si ya estaba aprobada, se cancela también en ${proveedor}.`,
        buttons: [
          { text: 'No', role: 'cancel', handler: () => resolve(false) },
          { text: 'Cancelar la solicitud', handler: () => resolve(true) }
        ]
      });
      await alert.present();
    });
    if (!confirmado) {
      return false;
    }
    try {
      await firstValueFrom(this.cancelar(empresa, pedido));
    } catch (error) {
      await this.avisar('No se ha podido cancelar', this.errorHandler.extractErrorMessage(error));
      return false;
    }
    this.firebaseAnalytics.logEvent('pago_a_plazos_cancelar', { pedido: (pedido ?? '').toString() });
    const toast = await this.toastCtrl.create({ message: 'Solicitud de pago a plazos cancelada.', duration: 2500, color: 'success' });
    await toast.present();
    return true;
  }

  /** null = canceló. Con la app, se elige entre el aviso a la app y el enlace; sin ella, solo el enlace (con el aviso de la API). */
  private elegirCanal(proveedor: string, datos: DisponibilidadPagoAPlazos): Promise<CanalPagoAPlazos | null> {
    return new Promise<CanalPagoAPlazos | null>(async resolve => {
      const importe = (+(datos.Importe || 0)).toFixed(2).replace('.', ',');
      const conApp = !!datos.ClienteTieneApp;
      const aviso = (datos.Aviso || '').trim();
      const message = conApp
        ? `Se financiarían ${importe} €. Se le mandará un aviso para que termine el pago en su app; si lo prefiere, le puede mandar el enlace.`
        : `Se financiarían ${importe} €. Le daremos el enlace para que se lo mande al cliente.${aviso ? ' ' + aviso : ''}`;
      const buttons: any[] = [{ text: 'Cancelar', role: 'cancel', handler: () => resolve(null) }];
      if (conApp) {
        buttons.push({ text: 'Mandar enlace', handler: () => resolve('Enlace') });
        buttons.push({ text: 'Avisar en su app', handler: () => resolve('App') });
      } else {
        buttons.push({ text: 'Pedir el enlace', handler: () => resolve('Enlace') });
      }
      const alert = await this.alertCtrl.create({ header: `Pagar a plazos con ${proveedor}`, message, buttons });
      await alert.present();
    });
  }

  private async ensenarResultado(proveedor: string, canal: CanalPagoAPlazos, respuesta: SolicitudPagoAPlazos): Promise<void> {
    const mensajeCliente = textoMensajeParaCliente(respuesta);
    const aviso = (respuesta?.Aviso || '').trim();
    if (!mensajeCliente) {
      // Aviso a la app que ha llegado a algún dispositivo: no hay nada que mandar.
      const toast = await this.toastCtrl.create({
        message: aviso || `Le hemos mandado el aviso a su app para que termine el pago con ${proveedor}.`,
        duration: 4000, color: 'success'
      });
      await toast.present();
      return;
    }
    const invitacion = (respuesta?.InvitacionApp || '').trim();
    const intro = canal === 'App'
      ? 'El aviso no ha llegado a ningún móvil del cliente: mándele el enlace.'
      : 'Mándele el enlace al cliente para que termine el pago.';
    const buttons: any[] = [
      { text: 'WhatsApp', handler: () => { this.whatsApp.enviarTexto(mensajeCliente); } },
      { text: 'Copiar', handler: () => { this.copiar(mensajeCliente); } }
    ];
    if (invitacion && !mensajeCliente.includes(invitacion)) {
      buttons.push({ text: 'Copiar invitación a la app', handler: () => { this.copiar(invitacion); } });
    }
    buttons.push({ text: 'Cerrar', role: 'cancel' });
    const alert = await this.alertCtrl.create({
      header: `Enlace de ${proveedor}`,
      message: `${intro}${aviso ? ' ' + aviso : ''}`,
      buttons
    });
    await alert.present();
  }

  private copiar(texto: string): void {
    navigator.clipboard?.writeText(texto).then(async () => {
      const toast = await this.toastCtrl.create({ message: 'Copiado.', duration: 1500 });
      await toast.present();
    }).catch(() => { });
  }

  private async avisar(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['Ok'] });
    await alert.present();
  }
}
