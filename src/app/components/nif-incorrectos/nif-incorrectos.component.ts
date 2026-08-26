import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ClienteService } from '../cliente/cliente.service';

/**
 * Issue #157 (NestoAPI#327): vista para que cada vendedor corrija el NIF de sus
 * clientes con NIF incorrecto (Verifactu). Lista priorizada por el servidor
 * (los que tienen pedido pendiente primero) + corrección revalidada contra la AEAT.
 */
@Component({
  selector: 'app-nif-incorrectos',
  templateUrl: './nif-incorrectos.component.html',
  styleUrls: ['./nif-incorrectos.component.scss'],
  standalone: false
})
export class NifIncorrectosComponent {

  datos: any[] = [];
  cargando: boolean = false;
  cargaInicialHecha: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private usuario: Usuario,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private errorHandler: ErrorHandlerService
  ) { }

  ionViewWillEnter(): void {
    if (!this.cargaInicialHecha) {
      this.cargar();
    }
  }

  cargar(event?: any): void {
    this.cargando = true;
    const vendedor = this.usuario.permitirVerClientesTodosLosVendedores ? undefined : this.usuario.vendedor;
    this.clienteService.getNifIncorrectos(vendedor).subscribe({
      next: (datos) => {
        this.datos = datos || [];
        this.cargando = false;
        this.cargaInicialHecha = true;
        if (event) { event.target.complete(); }
      },
      error: (error) => {
        this.cargando = false;
        if (event) { event.target.complete(); }
        this.toastCtrl.create({
          message: 'No se pudo cargar la lista: ' + this.errorHandler.extractErrorMessage(error),
          duration: 4000,
          color: 'danger'
        }).then(t => t.present());
      }
    });
  }

  /** La AEAT devuelve 2000-01-01 cuando no hay fecha real de validación: se muestra como "sin dato". */
  fechaMostrable(fecha: string): string | null {
    if (!fecha) { return null; }
    const d = new Date(fecha);
    if (isNaN(d.getTime()) || d.getFullYear() <= 2000) { return null; }
    return d.toLocaleDateString('es-ES');
  }

  async corregir(item: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Corregir NIF',
      subHeader: item.nombre,
      message: 'NIF actual: ' + (item.nif || '').trim() + '. Se revalidará contra la AEAT.',
      inputs: [
        { name: 'nif', type: 'text', value: (item.nif || '').trim(), placeholder: 'NIF correcto' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Corregir',
          handler: (data) => {
            const nuevo = (data.nif || '').trim();
            if (!nuevo) {
              this.toastCtrl.create({ message: 'Introduce un NIF', duration: 2500, color: 'warning' })
                .then(t => t.present());
              return false;
            }
            this.enviarCorreccion(item, nuevo);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private enviarCorreccion(item: any, nif: string): void {
    this.cargando = true;
    this.clienteService.corregirNif((item.cliente || '').trim(), nif).subscribe({
      next: (resultado) => {
        this.cargando = false;
        const partes: string[] = [];
        if (resultado?.nombreAeat) { partes.push(resultado.nombreAeat); }
        if (resultado?.contactosActualizados) { partes.push(resultado.contactosActualizados + ' contacto(s)'); }
        if (resultado?.facturasActualizadas) { partes.push(resultado.facturasActualizadas + ' factura(s) reabierta(s)'); }
        const detalle = partes.length ? ' (' + partes.join(' · ') + ')' : '';
        this.toastCtrl.create({
          message: 'NIF corregido' + detalle,
          duration: 4000,
          color: 'success'
        }).then(t => t.present());
        this.cargar();
      },
      error: (error) => {
        this.cargando = false;
        this.toastCtrl.create({
          message: this.errorHandler.extractErrorMessage(error),
          duration: 5000,
          color: 'danger'
        }).then(t => t.present());
      }
    });
  }
}
