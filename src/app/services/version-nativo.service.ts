import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Issue #88: salvaguarda para funciones que dependen del binario nativo (no solo del bundle web
 * entregado por Live Updates). El caso de uso típico es Outlook con deep link `msauth://...`:
 * el bundle web puede llegar a un vendedor cuyo APK no tenga el `intent-filter` correspondiente
 * en el AndroidManifest. Sin salvaguarda, al pulsar la función la app cascaría silenciosamente.
 *
 * Uso típico desde un componente:
 *   if (!await this.versionNativo.cumpleVersionMinima(21800, 'Crear cita en Outlook', '2.18.0')) return;
 *   // ... resto del flujo
 */
@Injectable({ providedIn: 'root' })
export class VersionNativoService {

  constructor(private alertCtrl: AlertController) { }

  /**
   * Comprueba que el versionCode del APK instalado sea >= al mínimo requerido. Si no, muestra
   * un alert informativo al usuario y devuelve false. En web (ionic serve) devuelve true porque
   * la versión nativa no aplica.
   */
  public async cumpleVersionMinima(versionCodeMinimo: number, nombreFeature: string, versionNombreMinima: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    let versionCodeActual: number | null = null;
    try {
      const info = await App.getInfo();
      versionCodeActual = Number(info.build);
    } catch (e) {
      // Si App.getInfo falla (poco probable en nativo), no bloqueamos: el peor caso es que la
      // función intente ejecutarse y falle abajo. Es preferible a bloquear sin certeza.
      console.warn('No se pudo obtener la versión nativa:', e);
      return true;
    }

    if (Number.isFinite(versionCodeActual) && versionCodeActual >= versionCodeMinimo) {
      return true;
    }

    const alert = await this.alertCtrl.create({
      header: 'Actualización necesaria',
      message: `${nombreFeature} requiere actualizar la app (versión mínima ${versionNombreMinima}). Instala el nuevo APK o ponte en contacto con el departamento de informática.`,
      buttons: ['Ok']
    });
    await alert.present();
    return false;
  }
}
