import { Component, OnInit, OnChanges } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SelectorBase } from '../selectorbase/selectorbase.component';
import { SelectorDireccionesEntregaService } from './selector-direcciones-entrega.service';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
    selector: 'selector-direcciones-entrega',
    templateUrl: './selector-direcciones-entrega.component.html',
    styleUrls: ['./selector-direcciones-entrega.component.scss'],
    inputs: ['cliente', 'seleccionado', 'totalPedido', 'forzarEstado'],
    standalone: false
})
export class SelectorDireccionesEntregaComponent extends SelectorBase implements OnChanges {
  private servicio: SelectorDireccionesEntregaService;
  private alertCtrl: AlertController;
  private errorHandler: ErrorHandlerService;
  public direccionesEntrega: any[];
  public direccionSeleccionada: any;

  // @Input() 
  private _cliente: any;
  get cliente() {
      return this._cliente;
  }
  set cliente(value: any) {
      if (value && value.trim() != this._cliente){
          this.cargarDatos(value);
          this._cliente = value;
      }
  }

  private _seleccionado: string;
  get seleccionado(): string {
      return this._seleccionado;
  }
  set seleccionado(value: string) {
      this._seleccionado = value;
      // Si ya hay direcciones cargadas y cambia seleccionado, seleccionar la dirección correcta
      if (value && this.direccionesEntrega && this.direccionesEntrega.length > 0) {
          const direccion = this.direccionesEntrega.find(d => d.contacto.trim() === value.trim());
          if (direccion && direccion !== this.direccionSeleccionada) {
              this.seleccionarDireccion(direccion);
          }
      }
  }

  public forzarEstado: number; // para que coja un contacto con un estado concreto

  private _totalPedido: number;
  get totalPedido() {
    return this._totalPedido;
  }
  set totalPedido(value: number) {
    if (value != this._totalPedido) {
        this.cargarDatos(this.cliente, value);
        this._totalPedido = value;
    }
  }

  constructor(servicio: SelectorDireccionesEntregaService, alertCtrl: AlertController, errorHandler: ErrorHandlerService) {
      super();
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.errorHandler = errorHandler;
  }

    public cargarDatos(cliente: any, totalPedido: number = 0): void {
      if (!cliente) {
          return;
      }
      this.servicio.direccionesEntrega(cliente, totalPedido).subscribe(
          async data => {
              if (data.length === 0) {
                  const alert: any = await this.alertCtrl.create({
                      message: 'Error',
                      subHeader: 'El cliente ' + cliente + ' no tiene ninguna dirección de entrega',
                      buttons: ['Ok'],
                  });
                  await alert.present();
              } else {
                    // Seleccionaremos la dirección con estos criterios:
                    // 1. Si hay this.seleccionado, seleccionar esa dirección
                    // 2. Si no hay this.seleccionado, mirar si hay alguno en el estado de forzarEstado y si lo hay lo seleccionamos
                    // 3. Si no hay ninguno en el estado de forzarEstado, seleccionar la dirección por defecto
                  this.direccionesEntrega = data;
                  if (this.seleccionado) {
                      this.direccionSeleccionada = this.direccionesEntrega.find(d => d.contacto.trim() == this.seleccionado.trim());
                  }
                  if (!this.direccionSeleccionada) {
                        if (this.forzarEstado) {
                            this.direccionSeleccionada = this.direccionesEntrega.find(d => d.estado == this.forzarEstado);
                        }
                        if (!this.direccionSeleccionada) {
                            this.direccionSeleccionada = this.direccionesEntrega.find(d => d.esDireccionPorDefecto);
                        }
                  }
                  // Issue #136: si hay direcciones pero ninguna cumple los criterios, caemos a la
                  // primera para no emitir undefined (que reventaba seleccionarCliente en el padre).
                  if (!this.direccionSeleccionada && this.direccionesEntrega.length > 0) {
                      this.direccionSeleccionada = this.direccionesEntrega[0];
                  }
                  this.seleccionarDato(this.direccionSeleccionada);

                  // Si no había seleccionado al cargar, volver a verificar después de un tick
                  // para dar tiempo a Angular de propagar bindings pendientes
                  if (!this.seleccionado) {
                      setTimeout(() => {
                          if (this.seleccionado && this.direccionesEntrega) {
                              const direccionCorrecta = this.direccionesEntrega.find(
                                  d => d.contacto.trim() === this.seleccionado.trim()
                              );
                              if (direccionCorrecta && direccionCorrecta !== this.direccionSeleccionada) {
                                  this.seleccionarDireccion(direccionCorrecta);
                              }
                          }
                      }, 100);
                  }
              }
          },
          // Issue #179: si falla la carga, el padre se quedaba sin dirección y la slide de pago
          // reventaba sin que el vendedor supiera por qué. Ahora se avisa con el motivo real.
          async error => {
              this.errorMessage = <any>error;
              if (error?.isCancelled) {
                  return;
              }
              const alert: any = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se han podido cargar las direcciones de entrega:\n' +
                      this.errorHandler.extractErrorMessage(error),
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
  }

  public seleccionarDireccion(direccion: any): void {
      this.direccionSeleccionada = direccion;
      this.seleccionarDato(direccion);
  }

  public ngOnChanges(changes): void {
      //this.cargarDatos(this.cliente);
  }

  public colorEstado(estado: number): string {
      if (estado == 0 || estado == 9) {
          return "success";
      }
      if (estado == 5) {
          return "danger";
      }
      if (estado == 7) {
          return "primary";
      }

      return "default";
  }
}
