import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, NavController, ModalController } from '@ionic/angular';
import { ExtractoClienteService } from './extracto-cliente.service';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { ReclamacionDeuda } from 'src/app/models/ReclamacionDeuda';

@Component({
  selector: 'app-extracto-cliente',
  templateUrl: './extracto-cliente.component.html',
  styleUrls: ['./extracto-cliente.component.scss'],
})
export class ExtractoClienteComponent {

  private servicio: ExtractoClienteService;
  constructor(servicio: ExtractoClienteService,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      private fileOpener: FileOpener,
      private nav: NavController,
      private firebaseAnalytics: FirebaseAnalytics,
      private modalCtrl: ModalController
      ) {
      this.servicio = servicio;
  };

  public mostrarClientes: boolean = true;
  public movimientosDeuda: any[];
  private errorMessage: string;
  public resumenDeuda: any = {};
  public tipoMovimientos: string = "deuda";
  public clienteSeleccionado: any;
  private hoy: Date;
  public movimientosSeleccionados: any[] = [];
  public mostrarBannerModelo347: boolean = false;
  public annoModelo347: number;

  @ViewChild('selector') selectorClientes: any;

  ngAfterViewInit() {
      setTimeout(()=>{
          this.selectorClientes.setFocus();
      },500)
  }

  public onSegmentChange(): void {
      if (!this.clienteSeleccionado || this.clienteSeleccionado.cliente == "") {
          return;
      }
      if (this.tipoMovimientos == "deuda") {
          this.cargarDeuda(this.clienteSeleccionado);
      } else if (this.tipoMovimientos == "facturas") {
          this.cargarFacturas(this.clienteSeleccionado);
      }else if (this.tipoMovimientos == "pedidos") {
          this.cargarPedidos(this.clienteSeleccionado);
      }
  }

  public cargarDeuda(cliente: any): void {
      this.mostrarClientes = false;
      this.movimientosSeleccionados = [];
      this.servicio.cargarDeuda(cliente).subscribe(
          data => {
              this.movimientosDeuda = data;
              if (!data.length) {
                  this.errorMessage = 'Este cliente no tiene deuda';
                  console.log('Este cliente no tiene deuda');
                  return;
              }
              this.resumenDeuda.total = 0;
              this.resumenDeuda.impagados = 0;
              this.resumenDeuda.vencida = 0;
              this.resumenDeuda.abogado = 0;
              this.hoy = new Date();

              for (let mov of this.movimientosDeuda) {
                  if (mov.tipo.trim() === '4') {
                      this.resumenDeuda.impagados += mov.importePendiente;
                  }
                  if (mov.vencimiento < this.hoy.toISOString()) {
                      this.resumenDeuda.vencida += mov.importePendiente;
                  }
                  if ((!mov.estado) || (mov.estado && mov.estado.trim() !== "DVD")) {
                      this.resumenDeuda.total += mov.importePendiente;

                      if (mov.ruta && mov.ruta.trim() === 'AB') {
                          this.resumenDeuda.abogado += mov.importePendiente;
                      }
                  }
              }

              console.log(this.resumenDeuda);
          },
          error => this.errorMessage = <any>error
      );
  }

  public cargarFacturas(cliente: any): void {
      this.mostrarClientes = false;
      this.actualizarVisibilidadBannerModelo347();
      this.servicio.cargarFacturas(cliente).subscribe(
          data => {
              this.movimientosDeuda = data;
              if (!data.length) {
                  this.errorMessage = 'Este cliente no tiene facturas';
                  console.log('Este cliente no tiene facturas');
                  return;
              }
          },
          error => this.errorMessage = <any>error
      );
  }

  private actualizarVisibilidadBannerModelo347(): void {
      const hoy = new Date();
      const mes = hoy.getMonth(); // 0 = enero, 1 = febrero
      this.mostrarBannerModelo347 = mes === 0 || mes === 1;
      this.annoModelo347 = hoy.getFullYear() - 1;
  }

  public async descargarModelo347(): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Generando certificado Modelo 347...',
      });

      await loading.present();

      this.servicio.descargarModelo347(
          this.clienteSeleccionado.empresa,
          this.clienteSeleccionado.cliente,
          this.annoModelo347
      ).then(
          async entry => {
              this.firebaseAnalytics.logEvent("descargar_modelo_347", {
                  empresa: this.clienteSeleccionado.empresa,
                  cliente: this.clienteSeleccionado.cliente,
                  anno: this.annoModelo347
              });
              await loading.dismiss();
              this.fileOpener.open(entry.toURL(), 'application/pdf');
          },
          async error => {
              await loading.dismiss();
              let alert = await this.alertCtrl.create({
                  header: 'Error',
                  message: 'No se pudo descargar el Modelo 347: ' + (error.message || error),
                  buttons: ['Ok'],
              });
              await alert.present();
          }
      );
  }

  public cargarPedidos(cliente: any): void {
      this.mostrarClientes = false;
      this.servicio.cargarPedidos(cliente).subscribe(
          data => {
              this.movimientosDeuda = data;
              if (!data.length) {
                  this.errorMessage = 'Este cliente no tiene pedidos';
                  console.log('Este cliente no tiene pedidos');
                  return;
              }
          },
          error => this.errorMessage = <any>error
      );
  }

  public abrirPedido(pedido: any): void {
    this.firebaseAnalytics.logEvent("extracto_cliente_abrir_pedido", {pedido: pedido});
      this.nav.navigateForward('pedido-venta', { queryParams: { empresa: pedido.empresa, numero: pedido.numero }});
  }


  public async descargarFactura(movimiento: any): Promise<void> {
      let loading: any = await this.loadingCtrl.create({
          message: 'Generando factura en PDF...',
      });

      loading.present();

      this.servicio.descargarFactura(movimiento.empresa, movimiento.documento).then(
          async entry => {
              this.firebaseAnalytics.logEvent("descargar_factura", {empresa: movimiento.empresa, factura: movimiento.documento});
              let alert = await this.alertCtrl.create({
                  message: 'PDF generado',
                  subHeader: "Factura descargada: \n"+entry.toURL(),
                  buttons: ['Ok'],
              });
              await alert.present();
              await loading.dismiss();
              this.fileOpener.open(entry.toURL(), 'application/pdf');
          },
          async error => {
              await loading.dismiss();
              this.errorMessage = <any>error;
          }
      );
  }

  public toggleSeleccion(movimiento: any): void {
      const index = this.movimientosSeleccionados.indexOf(movimiento);
      if (index > -1) {
          this.movimientosSeleccionados.splice(index, 1);
      } else {
          this.movimientosSeleccionados.push(movimiento);
      }
  }

  public estaSeleccionado(movimiento: any): boolean {
      return this.movimientosSeleccionados.indexOf(movimiento) > -1;
  }

  public async abrirModalEnlaceCobro(): Promise<void> {
      this.firebaseAnalytics.logEvent("extracto_cliente_abrir_modal_enlace_cobro", {});
      const modal = await this.modalCtrl.create({
          component: ModalEnviarEnlaceCobroComponent,
          componentProps: {
              'cliente': this.clienteSeleccionado,
              'movimientosSeleccionados': this.movimientosSeleccionados
          }
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
      if (data && data.enviado) {
          // Limpiar selección después de enviar
          this.movimientosSeleccionados = [];
      }
  }
}

@Component({
  selector: 'modal-enviar-enlace-cobro',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Enviar Enlace de Cobro</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card *ngIf="movimientosSeleccionados.length > 0">
        <ion-card-header>
          <ion-card-subtitle>Movimientos seleccionados</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let mov of movimientosSeleccionados" lines="none">
              <ion-label>
                <p>{{mov.concepto}}</p>
                <p>{{mov.importePendiente | currency:'EUR'}}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-list>
        <ion-item>
          <ion-label position="stacked">Importe</ion-label>
          <ion-input type="number" [(ngModel)]="importe" placeholder="0.00"></ion-input>
        </ion-item>
        <ion-item lines="none" *ngIf="importe">
          <ion-label>
            <p style="color: var(--ion-color-medium); font-size: 0.875rem;">{{importe | currency:'EUR'}}</p>
          </ion-label>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Concepto</ion-label>
          <ion-input [(ngModel)]="concepto" placeholder="Ej: Señal aparato estética"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Correo electrónico</ion-label>
          <ion-input type="email" [(ngModel)]="correo" placeholder="email@ejemplo.com"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Móvil</ion-label>
          <ion-input type="tel" [(ngModel)]="movil" placeholder="600123456"></ion-input>
        </ion-item>
      </ion-list>

      <ion-card *ngIf="resultado && resultado.TramitadoOK" color="success">
        <ion-card-header>
          <ion-card-title>¡Enlace generado correctamente!</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>{{resultado.Enlace}}</p>
          <ion-button expand="block" (click)="copiarEnlace()">
            <ion-icon name="copy" slot="start"></ion-icon>
            Copiar Enlace
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-card *ngIf="resultado && !resultado.TramitadoOK" color="danger">
        <ion-card-header>
          <ion-card-title>Error al generar el enlace</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>No se pudo procesar la solicitud. Por favor, inténtelo de nuevo.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="enviarEnlace()" [disabled]="!importe || !concepto || enviando">
          <ion-spinner *ngIf="enviando" name="crescent"></ion-spinner>
          <span *ngIf="!enviando">Enviar Enlace</span>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    ion-card-content p {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  `]
})
export class ModalEnviarEnlaceCobroComponent implements OnInit {
  cliente: any;
  movimientosSeleccionados: any[] = [];
  importe: number;
  concepto: string;
  correo: string;
  movil: string;
  resultado: ReclamacionDeuda;
  enviando: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private servicio: ExtractoClienteService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private firebaseAnalytics: FirebaseAnalytics
  ) {}

  async ngOnInit() {
    await this.cargarCorreoYMovil();
    this.calcularImporteYConcepto();
  }

  async cargarCorreoYMovil(): Promise<void> {
    try {
      const data = await this.servicio.leerCliente(
        this.cliente.empresa,
        this.cliente.cliente,
        this.cliente.contacto
      ).toPromise();

      const clienteCompleto = data;

      // Buscar móvil en los teléfonos
      if (clienteCompleto.Telefono) {
        const telefonos = clienteCompleto.Telefono.split("/");
        this.movil = telefonos.find(x => x.startsWith("6") || x.startsWith("7") || x.startsWith("8")) || '';
      }

      // Buscar correo en personas de contacto
      if (clienteCompleto.PersonasContacto && clienteCompleto.PersonasContacto.length > 0) {
        const personaContactoFacturacion = clienteCompleto.PersonasContacto.find(x => x.FacturacionElectronica);
        if (personaContactoFacturacion && personaContactoFacturacion.CorreoElectronico) {
          this.correo = personaContactoFacturacion.CorreoElectronico;
        }

        if (!this.correo) {
          const personaContactoCorreo = clienteCompleto.PersonasContacto.find(x => x.CorreoElectronico);
          if (personaContactoCorreo && personaContactoCorreo.CorreoElectronico) {
            this.correo = personaContactoCorreo.CorreoElectronico;
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar correo y móvil:', error);
      // Intentar con los datos básicos del cliente
      this.correo = this.cliente.correo || '';
      this.movil = this.cliente.telefono || '';
    }
  }

  calcularImporteYConcepto(): void {
    if (this.movimientosSeleccionados.length > 0) {
      // Calcular importe total
      this.importe = this.movimientosSeleccionados.reduce((sum, mov) => sum + mov.importePendiente, 0);

      // Generar concepto con números de factura
      const facturas: string[] = [];
      for (let mov of this.movimientosSeleccionados) {
        if (mov.documento) {
          facturas.push(mov.documento.trim());
        }
      }

      if (facturas.length > 0) {
        let conceptoGenerado = 'Pago facturas ' + facturas.join(', ');
        if (conceptoGenerado.length > 50) {
          // Truncar y añadir "y más"
          conceptoGenerado = conceptoGenerado.substring(0, 43) + ' y más';
        }
        this.concepto = conceptoGenerado;
      } else {
        this.concepto = 'Pago de deuda pendiente';
      }
    }
  }

  async enviarEnlace(): Promise<void> {
    if (!this.importe || !this.concepto) {
      return;
    }

    this.enviando = true;
    this.firebaseAnalytics.logEvent("enviar_enlace_cobro", {cliente: this.cliente.cliente, importe: this.importe});

    const asunto = this.concepto + ' - Nueva Visión';
    const textoSMS = 'Este es un mensaje de @COMERCIO@. Puede pagar ' + this.concepto + ' de @IMPORTE@ @MONEDA@ aquí: @URL@';

    this.servicio.mandarEnlaceCobro(
      this.cliente.cliente,
      this.correo,
      this.movil,
      this.importe,
      asunto,
      textoSMS
    ).subscribe(
      async (resultado: ReclamacionDeuda) => {
        this.resultado = resultado;
        this.enviando = false;

        if (resultado.TramitadoOK) {
          this.firebaseAnalytics.logEvent("enlace_cobro_enviado_ok", {cliente: this.cliente.cliente});
        } else {
          this.firebaseAnalytics.logEvent("enlace_cobro_error", {cliente: this.cliente.cliente});
        }
      },
      async error => {
        this.enviando = false;
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo enviar el enlace: ' + error,
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  async copiarEnlace(): Promise<void> {
    if (this.resultado && this.resultado.Enlace) {
      // Usar la API del portapapeles
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(this.resultado.Enlace);
          const alert = await this.alertCtrl.create({
            header: 'Copiado',
            message: 'El enlace se ha copiado al portapapeles',
            buttons: ['OK']
          });
          await alert.present();
          this.firebaseAnalytics.logEvent("enlace_cobro_copiado", {});
        } catch (err) {
          console.error('Error al copiar: ', err);
        }
      }
    }
  }

  cerrar(): void {
    this.modalCtrl.dismiss({
      enviado: this.resultado && this.resultado.TramitadoOK
    });
  }
}
