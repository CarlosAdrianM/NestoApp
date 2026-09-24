import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { ErrorHandlerService } from './error-handler.service';

/**
 * NestoApp#191 / NestoAPI#533: con picking (o albarán de hoy) el modo de entrega ya no se cambia desde
 * la app; se ofrece pedírselo a almacén, que responde al correo de quien lo pide. Nunca se promete:
 * el texto lo pone la API («lo intentarán, pero puede que ya no llegue a tiempo»).
 * Caso real: pedido 926879, pasado a «Todo junto» con el picking hecho sin que almacén se enterase.
 */
@Injectable({
  providedIn: 'root'
})
export class SolicitudCambioModoService {

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private errorHandler: ErrorHandlerService
  ) { }

  public solicitar(empresa: string, pedido: number, modoDeseado: number, comentario: string | null): Observable<string> {
    return this.http.post<string>(Configuracion.API_URL + '/PedidosVenta/SolicitudCambioModo', {
      Empresa: empresa,
      Pedido: pedido,
      ModoDeseado: modoDeseado,
      Comentario: comentario
    });
  }

  /** Enseña el motivo del rechazo y ofrece pedir el cambio a almacén, con un comentario opcional. */
  public async ofrecer(motivo: string, empresa: string, pedido: number, modoDeseado: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Modo de entrega',
      message: motivo,
      inputs: [{ name: 'comentario', type: 'textarea', placeholder: 'Comentario para almacén (opcional)' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Pedir el cambio a almacén', handler: datos => { this.enviar(empresa, pedido, modoDeseado, datos?.comentario); } }
      ]
    });
    await alert.present();
  }

  private enviar(empresa: string, pedido: number, modoDeseado: number, comentario: string | undefined): void {
    const texto = (comentario || '').trim() || null;
    this.solicitar(empresa, pedido, modoDeseado, texto).subscribe({
      next: async respuesta => {
        const alert = await this.alertCtrl.create({
          header: 'Pedido a almacén',
          message: respuesta || 'Se lo hemos pedido a almacén. Si todavía están a tiempo, lo cambiarán ellos.',
          buttons: ['Ok']
        });
        await alert.present();
      },
      error: async error => {
        const alert = await this.alertCtrl.create({
          header: 'No se ha podido pedir el cambio',
          message: this.errorHandler.extractErrorDetail(error) || 'Llama o escribe a almacén directamente.',
          buttons: ['Ok']
        });
        await alert.present();
      }
    });
  }
}
