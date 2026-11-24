import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { CuponesService } from 'src/app/services/cupones.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import {
  CuponCliente, LONGITUD_MAXIMA_MOTIVO_ADELANTAR_CUPON, errorMotivoAdelantarCupon, sePuedeAdelantarCupon, textoCuponAdelantado
} from 'src/app/models/cupon.model';

/**
 * NestoApp#291 (gemela de NestoAPI#885): junto al aviso «tiene un cupón que vale desde el…», si la API dice que este
 * usuario puede adelantarlo (`SePuedeAdelantar`: Dirección y los jefes de equipo en los clientes de sus vendedores), el
 * botón «Usar ya (excepción)», que pide el motivo (obligatorio) y deja el cupón valiendo desde hoy. También dice si un
 * cupón se adelantó, por quién y cuándo. Al adelantarlo actualiza el propio objeto del cupón (quien lo pinta no tiene
 * que volver a leer) y avisa con `(adelantado)`. Textos de usted.
 */
@Component({
  selector: 'app-adelantar-cupon',
  templateUrl: './adelantar-cupon.component.html',
  standalone: false
})
export class AdelantarCuponComponent {
  @Input() cupon: CuponCliente | null = null;
  /** El ancla del globo, «<ruta>.<Control>» de la pantalla que lo pinta (p. ej. `plantilla-venta.UsarCuponYa`). */
  @Input() ancla = '';
  @Output() adelantado = new EventEmitter<CuponCliente>();
  public enviando = false;

  constructor(
    private servicio: CuponesService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private errorHandler: ErrorHandlerService,
    private firebaseAnalytics: FirebaseAnalytics
  ) { }

  get sePuedeAdelantar(): boolean {
    return sePuedeAdelantarCupon(this.cupon);
  }

  get textoAdelantado(): string {
    return textoCuponAdelantado(this.cupon);
  }

  /** Pide el motivo; no se cierra mientras no sea válido. */
  public async pedirMotivo(): Promise<void> {
    if (!this.sePuedeAdelantar || this.enviando) {
      return;
    }
    const alerta = await this.alertCtrl.create({
      header: 'Usar ya (excepción)',
      message: `El cupón ${this.cupon.Codigo} pasará a valer desde hoy, sin esperar al día del evento. Queda anotado quién lo adelanta y por qué, y se avisa a Administración. Escriba el motivo.`,
      inputs: [{
        name: 'motivo', type: 'textarea', placeholder: 'Motivo de la excepción (obligatorio)',
        attributes: { maxlength: LONGITUD_MAXIMA_MOTIVO_ADELANTAR_CUPON, 'aria-label': 'Motivo de la excepción' }
      }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Usar ya',
          handler: (datos: any) => {
            const error = errorMotivoAdelantarCupon(datos?.motivo);
            if (error) {
              alerta.message = error;
              return false;
            }
            this.adelantar(datos.motivo);
            return true;
          }
        }
      ]
    });
    await alerta.present();
  }

  public async adelantar(motivo: string): Promise<void> {
    if (!this.cupon || this.enviando || errorMotivoAdelantarCupon(motivo)) {
      return;
    }
    this.enviando = true;
    const cupon = this.cupon;
    const loading = await this.loadingCtrl.create({ message: 'Adelantando el cupón...' });
    await loading.present();
    try {
      const nuevo = await firstValueFrom(this.servicio.adelantar(cupon.Codigo, motivo));
      await loading.dismiss();
      this.firebaseAnalytics.logEvent('cupon_adelantar', { cupon: cupon.Codigo });
      // El mismo objeto que pinta quien nos usa: ya vale (Activo, SePuedeUsar) sin tener que recargar la lista.
      Object.assign(cupon, nuevo || {}, { SePuedeAdelantar: false, Adelantado: true });
      this.adelantado.emit(cupon);
      const alerta = await this.alertCtrl.create({
        header: 'Cupón adelantado',
        message: (cupon.Mensaje || '').trim() || `El cupón ${cupon.Codigo} ya se puede usar.`,
        buttons: ['Entendido']
      });
      await alerta.present();
    } catch (error) {
      await loading.dismiss();
      const status = error?.status ?? error?.statusCode;
      const alerta = await this.alertCtrl.create({
        header: status === 403 ? 'No tiene permiso para adelantar este cupón'
          : status === 409 ? 'Este cupón no se puede adelantar' : 'No se ha podido adelantar el cupón',
        message: this.errorHandler.extractErrorMessage(error),
        buttons: ['Ok']
      });
      await alerta.present();
      if (status === 409 || status === 403) {
        // Ya no tiene sentido seguir ofreciéndolo.
        cupon.SePuedeAdelantar = false;
      }
    } finally {
      this.enviando = false;
    }
  }
}
