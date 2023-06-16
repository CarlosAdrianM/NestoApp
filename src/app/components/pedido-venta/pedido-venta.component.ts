import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { NavController, AlertController, LoadingController, NavParams } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { LineaVenta } from '../linea-venta/linea-venta';
import { PedidoVenta } from './pedido-venta';
import { PedidoVentaService } from './pedido-venta.service';

@Component({
  selector: 'app-pedido-venta',
  templateUrl: './pedido-venta.component.html',
  styleUrls: ['./pedido-venta.component.scss'],
})
export class PedidoVentaComponent  {

  public hoy: Date = new Date();
  private iva: string;
  private nav: NavController;
  public pedido: PedidoVenta;
  public segmentoPedido: string = 'cabecera';
  private servicio: PedidoVentaService;
  private alertCtrl: AlertController;
  private loadingCtrl: LoadingController;
  private _fechaEntrega: string;
  public listaEnlacesSeguimiento;
  get fechaEntrega() {
      return this._fechaEntrega;
  }
  set fechaEntrega(value: string) {
      if (this._fechaEntrega) {
          this.pedido.Lineas.forEach(l => {
              if (l.picking == 0 && (l.estado == -1 || l.estado == 1)) {
                  l.fechaEntrega = new Date(value)
              }
          });
      }
      this._fechaEntrega = value;
  }

      
  constructor(servicio: PedidoVentaService, 
    nav: NavController, 
    alertCtrl: AlertController, 
    loadingCtrl: LoadingController, 
    private usuario: Usuario,
    private route: ActivatedRoute,
    private firebaseAnalytics: FirebaseAnalytics
    ) {
      this.nav = nav;
      this.servicio = servicio;
      this.alertCtrl = alertCtrl;
      this.loadingCtrl = loadingCtrl;
      this.cargarPedido(this.route.snapshot.queryParams.empresa,this.route.snapshot.queryParams.numero);
  }

  public async cargarPedido(empresa: string, numero: number): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Cargando Pedido...',
      });

      await loading.present();

      this.servicio.cargarPedido(empresa, numero).subscribe(
          data => {
              this.firebaseAnalytics.logEvent("cargar_pedido", {empresa: empresa, pedido: numero});
              this.pedido = data as PedidoVenta;
              for (let i = 0; i < this.pedido.Lineas.length; i++) {
                  this.pedido.Lineas[i] = new LineaVenta(this.pedido.Lineas[i]);
              }
              this.iva = this.pedido.iva;
              this.pedido.plazosPago = this.pedido.plazosPago.trim(); // Cambiar en la API
              this.pedido.vendedor = this.pedido.vendedor.trim(); // Cambiar en la API
              if (this.pedido.Lineas && this.pedido.Lineas.length > 0) {
                  this.fechaEntrega = this.pedido.Lineas[0].fechaEntrega.toString();
              }
              this.servicio.cargarEnlacesSeguimiento(empresa, numero).subscribe(
                  data => {
                      this.listaEnlacesSeguimiento = data;
                  },
                  async error => {
                      let textoError = 'No se han podido cargar los seguimietnos del pedido de la empresa ' + empresa + ".\n" + error.ExceptionMessage;
                      let innerException = error.InnerException;
                      while (innerException != null) {
                        textoError += '\n' + innerException.ExceptionMessage;
                        innerException = innerException.InnerException;
                      }
                      let alert = await this.alertCtrl.create({
                          header: 'Error',
                          message: textoError,
                          buttons: ['Ok'],
                      });
                      await alert.present();
                      await loading.dismiss();
                  }
              )
          },
          async error => {
              let textoError = 'No se ha podido cargar el pedido de la empresa ' + empresa + ".\n" + error.ExceptionMessage;
              let innerException = error.InnerException;
              while (innerException != null) {
                textoError += '\n' + innerException.ExceptionMessage;
                innerException = innerException.InnerException;
              }
              let alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: textoError,
                  buttons: ['Ok'],
              });
              await alert.present();
              await loading.dismiss();
          },
          async () => {
              await loading.dismiss();
          }
      );
  }
  
  public seleccionarFormaPago(evento: any): void {
      this.firebaseAnalytics.logEvent("pedido_seleccionar_forma_pago", {pedido:this.pedido.numero, formaPago: evento});
      this.pedido.formaPago = evento;
  }

  public cambiarIVA(): void {
      this.firebaseAnalytics.logEvent("pedido_cambiar_iva", {actual: this.pedido.iva, nuevo: this.pedido.iva ? undefined : this.iva});
      this.pedido.iva = this.pedido.iva ? undefined : this.iva;
  }

  public abrirLinea(linea: LineaVenta) {
      this.firebaseAnalytics.logEvent("pedido_venta_abrir_linea", {linea: linea, cliente: this.pedido.cliente, contacto: this.pedido.contacto});
      this.nav.navigateForward('linea-venta', { queryParams: {linea: linea, cliente: this.pedido.cliente, contacto: this.pedido.contacto}});
  }

  public annadirLinea() {
      this.firebaseAnalytics.logEvent("pedido_venta_annadir_linea", {pedido: this.pedido.numero});
      let linea: LineaVenta = new LineaVenta();
      linea.copiarDatosPedido(this.pedido);
      linea.usuario = Configuracion.NOMBRE_DOMINIO + '\\' + this.usuario.nombre;
      this.abrirLinea(linea);
      this.pedido.Lineas = this.pedido.Lineas.concat(linea);
  }

  public async borrarLinea(linea: LineaVenta) {
      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea borrar la línea?',
          buttons: [
              {
                  text: 'Sí',
                  handler: () => {
                      this.firebaseAnalytics.logEvent("pedido_venta_borrar_linea", {pedido: this.pedido.numero, linea:linea.id});
                      this.pedido.Lineas = this.pedido.Lineas.filter(obj => obj !== linea);
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });
      await confirm.present();
  }

  public async modificarPedido(): Promise<void> {

      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Está seguro que quiere modificar el pedido?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      // Hay que guardar el pedido original en alguna parte
                      let loading: any = await this.loadingCtrl.create({
                          message: 'Modificando Pedido...',
                      });

                      await loading.present();

                      this.servicio.modificarPedido(this.pedido).subscribe(
                          async data => {
                              this.firebaseAnalytics.logEvent("modificar_pedido_venta", {pedido: this.pedido.numero});
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              let alert = await this.alertCtrl.create({
                                  header: 'Modificado',
                                  message: 'Pedido modificado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                            let textoError = 'No se ha podido modificar el pedido.\n' + error.ExceptionMessage;
                              let innerException = error.InnerException;
                              while (innerException != null) {
                                textoError += '\n' + innerException.ExceptionMessage;
                                innerException = innerException.InnerException;
                              }
                              let alert = await this.alertCtrl.create({
                                  header: 'Error',
                                  message: textoError,
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          () => {
                              //loading.dismiss();
                          }
                      );
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });

      await confirm.present();
  }

  
  public async aceptarPresupuesto(): Promise<void> {

      let confirm = await this.alertCtrl.create({
          header: 'Confirmar',
          message: '¿Desea aceptar el presupuesto?',
          buttons: [
              {
                  text: 'Sí',
                  handler: async () => {
                      // Hay que guardar el pedido original en alguna parte
                      let loading: any = await this.loadingCtrl.create({
                          message: 'Aceptando presupuesto...',
                      });
                      this.firebaseAnalytics.logEvent("pedido_venta_aceptar_presupuesto", {pedido: this.pedido.numero});
                      await loading.present();

                      this.pedido.EsPresupuesto = false;
                      this.servicio.modificarPedido(this.pedido).subscribe(
                          async data => {
                              this.cargarPedido(this.pedido.empresa, this.pedido.numero);
                              let alert = await this.alertCtrl.create({
                                  header: 'Aceptado',
                                  message: 'Presupuesto aceptado correctamente',
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          async error => {
                            let textoError = 'No se ha podido aceptar el presupuesto.\n' + error.ExceptionMessage;
                              let innerException = error.InnerException;
                              while (innerException != null) {
                                textoError += '\n' + innerException.ExceptionMessage;
                                innerException = innerException.InnerException;
                              }
                              let alert = await this.alertCtrl.create({
                                  header: 'Error',
                                  message: textoError,
                                  buttons: ['Ok'],
                              });
                              await alert.present();
                              await loading.dismiss();
                          },
                          () => {
                              //loading.dismiss();
                          }
                      );
                  }
              },
              {
                  text: 'No',
                  handler: () => {
                      return;
                  }
              }

          ]
      });

      await confirm.present();
  }


  public cadenaFecha(cadena: string): Date {
      return new Date(cadena);
  }

  public abrirEnlace(urlDestino: string): void {
      this.firebaseAnalytics.logEvent("pedido_venta_abrir_enlace", {enlace: urlDestino});
      window.open(urlDestino, '_system', 'location=yes');
  }
}
