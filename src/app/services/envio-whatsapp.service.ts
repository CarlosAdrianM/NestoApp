import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { Observable, firstValueFrom } from 'rxjs';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { EnlaceDescarga, TipoDocumentoEnlace, textoMovil, textoWhatsAppVarios, urlWhatsApp } from '../models/enlace-descarga.model';
import { ErrorHandlerService } from './error-handler.service';

/**
 * NestoApp#261 (NestoAPI#737 / Nesto#570): «Enviar por WhatsApp» el pedido o la factura. Pide a la API el enlace de
 * descarga (30 días) con el texto de usted ya escrito y abre WhatsApp en el móvil: si el cliente tiene varios móviles se
 * elige uno; si no tiene ninguno, se abre WhatsApp sin número para que el vendedor elija el contacto.
 */
@Injectable({
  providedIn: 'root'
})
export class EnvioWhatsAppService {
  /** Sustituible en los tests. */
  public abrir: (url: string) => void = url => { window.open(url, '_system'); };

  constructor(private http: HttpClient,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private errorHandler: ErrorHandlerService) { }

  public crearEnlaceDescarga(tipo: TipoDocumentoEnlace, empresa: string, numero: string | number): Observable<EnlaceDescarga> {
    return this.http.post<EnlaceDescarga>(`${Configuracion.API_URL}/Documentos/EnlaceDescarga`, {
      Tipo: tipo, Empresa: (empresa ?? '1').toString().trim() || '1', Numero: (numero ?? '').toString().trim()
    });
  }

  public async enviarDocumento(tipo: TipoDocumentoEnlace, empresa: string, numero: string | number): Promise<boolean> {
    if (!numero) {
      return false;
    }
    const loading = await this.loadingCtrl.create({ message: 'Preparando el enlace...' });
    await loading.present();
    let enlace: EnlaceDescarga;
    try {
      enlace = await firstValueFrom(this.crearEnlaceDescarga(tipo, empresa, numero));
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'No se ha podido preparar el enlace',
        message: this.errorHandler.extractErrorMessage(error),
        buttons: ['Ok']
      });
      await alert.present();
      return false;
    }
    await loading.dismiss();
    if (!enlace?.Texto) {
      return false;
    }
    const movil = await this.elegirMovil(enlace.Moviles || []);
    if (movil === undefined) {
      return false; // canceló
    }
    this.abrir(urlWhatsApp(movil, enlace.Texto));
    return true;
  }

  /**
   * NestoApp#69: varios documentos (las facturas seleccionadas) en un solo mensaje, con el enlace de cada uno. Se pide un
   * enlace por documento; si alguno falla, se avisa y se mandan los demás.
   */
  public async enviarVariosDocumentos(tipo: TipoDocumentoEnlace, empresa: string, numeros: (string | number)[]): Promise<boolean> {
    const lista = (numeros || []).map(n => (n ?? '').toString().trim()).filter(n => !!n);
    if (lista.length === 0) {
      return false;
    }
    if (lista.length === 1) {
      return this.enviarDocumento(tipo, empresa, lista[0]);
    }
    const loading = await this.loadingCtrl.create({ message: 'Preparando los enlaces...' });
    await loading.present();
    const enlaces: EnlaceDescarga[] = [];
    const fallidos: string[] = [];
    for (const numero of lista) {
      try {
        enlaces.push(await firstValueFrom(this.crearEnlaceDescarga(tipo, empresa, numero)));
      } catch {
        fallidos.push(numero);
      }
    }
    await loading.dismiss();
    if (enlaces.length === 0) {
      const alert = await this.alertCtrl.create({ header: 'No se han podido preparar los enlaces', message: `No se ha podido preparar ningún enlace (${fallidos.join(', ')}).`, buttons: ['Ok'] });
      await alert.present();
      return false;
    }
    if (fallidos.length > 0) {
      const aviso = await this.alertCtrl.create({ header: 'Algunas no se pueden mandar', message: `No se ha podido preparar el enlace de: ${fallidos.join(', ')}. Se mandan las demás.`, buttons: ['Ok'] });
      await aviso.present();
      await aviso.onDidDismiss();
    }
    const movil = await this.elegirMovil(enlaces[0].Moviles || []);
    if (movil === undefined) {
      return false;
    }
    this.abrir(urlWhatsApp(movil, textoWhatsAppVarios(enlaces)));
    return true;
  }

  /** NestoApp#281: un texto ya escrito (p. ej. el enlace del pago a plazos): se abre WhatsApp para que el vendedor elija el contacto. */
  public enviarTexto(texto: string): boolean {
    const limpio = (texto || '').trim();
    if (!limpio) {
      return false;
    }
    this.abrir(urlWhatsApp(null, limpio));
    return true;
  }

  /** null = sin móvil (se abre WhatsApp sin número); undefined = el usuario canceló. */
  private async elegirMovil(moviles: string[]): Promise<string | null | undefined> {
    const validos = (moviles || []).map(m => (m || '').toString().trim()).filter(m => !!m);
    if (validos.length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Sin móvil',
        message: 'El cliente no tiene ningún móvil en su ficha. Se abre WhatsApp para que elija usted el contacto.',
        buttons: ['Ok']
      });
      await alert.present();
      await alert.onDidDismiss();
      return null;
    }
    if (validos.length === 1) {
      return validos[0];
    }
    return new Promise<string | undefined>(async resolve => {
      const hoja = await this.actionSheetCtrl.create({
        header: '¿A qué móvil?',
        buttons: [
          ...validos.map(m => ({ text: textoMovil(m), icon: 'logo-whatsapp', handler: () => { resolve(m); } })),
          { text: 'Cancelar', role: 'cancel', handler: () => { resolve(undefined); } }
        ]
      });
      await hoja.present();
    });
  }
}
